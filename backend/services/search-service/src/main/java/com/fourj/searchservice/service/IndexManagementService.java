package com.fourj.searchservice.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.indices.*;
import co.elastic.clients.json.JsonData;
import com.fourj.searchservice.config.ElasticsearchConfig;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexManagementService {
    
    private final ElasticsearchClient client;
    private final ElasticsearchConfig elasticsearchConfig;
    
    /**
     * Khởi tạo các indices khi ứng dụng khởi động
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeIndices() {
        try {
            createProductIndexIfNotExists();
        } catch (IOException e) {
            log.error("Failed to initialize Elasticsearch indices", e);
            // Trong môi trường thực tế, có thể cân nhắc việc dừng ứng dụng nếu không tạo được index
            // throw new RuntimeException("Failed to initialize Elasticsearch indices", e);
        }
    }
    
    /**
     * Tạo product index nếu chưa tồn tại
     */
    @CircuitBreaker(name = "elasticsearch")
    private void createProductIndexIfNotExists() throws IOException {
        var indexSettings = elasticsearchConfig.getIndexSettings().getProducts();
        String indexName = indexSettings.getName();
        
        boolean exists = client.indices().exists(ex -> ex.index(indexName)).value();
        
        if (!exists) {
            log.info("Creating Elasticsearch index: {}", indexName);
            
            // Tạo aliases cho index
            Map<String, Alias> aliases = new HashMap<>();
            for (String alias : indexSettings.getAliases()) {
                aliases.put(alias, Alias.of(a -> a.isWriteIndex(true)));
            }
            
            // Chuẩn bị phân tích tiếng Việt
            Map<String, JsonData> vietnameseStopFilter = new HashMap<>();
            vietnameseStopFilter.put("type", JsonData.of("stop"));
            vietnameseStopFilter.put("stopwords", JsonData.of("_vietnamese_"));
            
            Map<String, JsonData> vietnameseAnalyzer = new HashMap<>();
            vietnameseAnalyzer.put("type", JsonData.of("custom"));
            vietnameseAnalyzer.put("tokenizer", JsonData.of("icu_tokenizer"));
            vietnameseAnalyzer.put("filter", JsonData.of(new String[]{"icu_folding", "lowercase", "vietnamese_stop"}));
            
            Map<String, JsonData> analyzers = new HashMap<>();
            analyzers.put("vietnamese_analyzer", JsonData.of(vietnameseAnalyzer));
            
            Map<String, JsonData> filters = new HashMap<>();
            filters.put("vietnamese_stop", JsonData.of(vietnameseStopFilter));
            
            Map<String, JsonData> analysis = new HashMap<>();
            analysis.put("analyzer", JsonData.of(analyzers));
            analysis.put("filter", JsonData.of(filters));
            
            CreateIndexResponse response = client.indices().create(c -> c
                    .index(indexName)
                    .settings(s -> s
                            .numberOfShards(String.valueOf(indexSettings.getShards()))
                            .numberOfReplicas(String.valueOf(indexSettings.getReplicas()))
                            .refreshInterval(i -> i.time(indexSettings.getRefreshInterval()))
                            .otherSettings("analysis", JsonData.of(analysis)))
                    .mappings(m -> m
                            .properties("id", p -> p.keyword(k -> k))
                            .properties("name", p -> p.text(txt -> txt.analyzer("vietnamese_analyzer")))
                            .properties("description", p -> p.text(txt -> txt.analyzer("vietnamese_analyzer")))
                            .properties("price", p -> p.double_(d -> d))
                            .properties("stockQuantity", p -> p.integer(i -> i))
                            .properties("imageUrl", p -> p.keyword(k -> k))
                            .properties("categoryId", p -> p.long_(l -> l))
                            .properties("categoryName", p -> p.keyword(k -> k))
                            .properties("active", p -> p.boolean_(b -> b))
                            .properties("createdAt", p -> p.date(d -> d))
                            .properties("updatedAt", p -> p.date(d -> d))
                            .properties("attributes", p -> p.nested(n -> n
                                    .properties("name", np -> np.keyword(k -> k))
                                    .properties("value", np -> np.keyword(k -> k))
                                    .properties("displayName", np -> np.text(t2 -> t2.analyzer("vietnamese_analyzer")))
                                    .properties("displayValue", np -> np.text(t2 -> t2.analyzer("vietnamese_analyzer")))))
                            // Các trường bổ sung cho tìm kiếm
                            .properties("originalPrice", p -> p.double_(d -> d))
                            .properties("discountPercent", p -> p.double_(d -> d))
                            .properties("inStock", p -> p.boolean_(b -> b))
                            .properties("images", p -> p.object(o -> o))
                            .properties("rating", p -> p.float_(f -> f))
                            .properties("reviewCount", p -> p.integer(i -> i))
                            .properties("soldCount", p -> p.integer(i -> i))
                            .properties("tags", p -> p.keyword(k -> k))
                            .properties("nameSuggest", p -> p.completion(comp -> comp
                                    .analyzer("vietnamese_analyzer"))))
                    .aliases(aliases));
            
            log.info("Index created: {}, acknowledged: {}", indexName, response.acknowledged());
        } else {
            log.info("Elasticsearch index already exists: {}", indexName);
        }
    }
    
    /**
     * Xóa index
     */
    public void deleteIndex(String indexName) throws IOException {
        DeleteIndexResponse response = client.indices().delete(d -> d.index(indexName));
        log.info("Index deleted: {}, acknowledged: {}", indexName, response.acknowledged());
    }
    
    /**
     * Tạo lại index (xóa nếu tồn tại và tạo mới)
     */
    public void recreateIndex() throws IOException {
        String indexName = elasticsearchConfig.getIndexSettings().getProducts().getName();
        boolean exists = client.indices().exists(e -> e.index(indexName)).value();
        
        if (exists) {
            deleteIndex(indexName);
        }
        
        createProductIndexIfNotExists();
    }
} 