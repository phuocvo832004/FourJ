package com.fourj.searchservice.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.SuggestMode;
import co.elastic.clients.elasticsearch._types.aggregations.AggregationRange;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Highlight;
import co.elastic.clients.elasticsearch.core.search.HighlightField;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.search.Suggester;
import co.elastic.clients.json.JsonData;
import com.fourj.searchservice.config.ElasticsearchConfig;
import com.fourj.searchservice.document.ProductDocument;
import com.fourj.searchservice.dto.SearchRequest.PriceRange;
import com.fourj.searchservice.dto.SearchRequest.SortOption;
import com.fourj.searchservice.dto.SearchResponse.FacetEntry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {
    
    private final ElasticsearchClient client;
    private final ElasticsearchConfig elasticsearchConfig;
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * Tìm kiếm sản phẩm theo các tiêu chí
     */
    @CircuitBreaker(name = "elasticsearch", fallbackMethod = "searchProductsFallback")
    @Retry(name = "elasticsearch")
    @Timed("search.products")
    public com.fourj.searchservice.dto.SearchResponse searchProducts(com.fourj.searchservice.dto.SearchRequest request) throws IOException {
        // Tạo cache key từ request
        String cacheKey = generateCacheKey(request);
        
        // Kiểm tra cache
        Object cachedResult = redisTemplate.opsForValue().get(cacheKey);
        if (cachedResult != null) {
            log.debug("Cache hit for search request");
            return (com.fourj.searchservice.dto.SearchResponse) cachedResult;
        }
        
        log.debug("Cache miss for search request");
        Instant start = Instant.now();
        
        // Tìm kiếm từ Elasticsearch
        SearchResponse<ProductDocument> response = client.search(s -> {
            SearchRequest.Builder builder = new SearchRequest.Builder();
            builder.index(elasticsearchConfig.getIndexSettings().getProducts().getName());
            builder.query(buildQuery(request));
            builder.from(request.getFrom());
            builder.size(request.getSize());
            
            // Highlight settings
            Map<String, HighlightField> highlightFields = new HashMap<>();
            highlightFields.put("name", HighlightField.of(h -> h));
            highlightFields.put("description", HighlightField.of(h -> h));
            
            builder.highlight(h -> h
                    .fields(highlightFields)
                    .preTags("<em>")
                    .postTags("</em>")
                    .requireFieldMatch(false));
            
            // Sorting options
            if (request.getSortOption() != null) {
                switch (request.getSortOption()) {
                    case PRICE_ASC:
                        builder.sort(s1 -> s1.field(f -> f.field("price").order(SortOrder.Asc)));
                        break;
                    case PRICE_DESC:
                        builder.sort(s1 -> s1.field(f -> f.field("price").order(SortOrder.Desc)));
                        break;
                    case NEWEST:
                        builder.sort(s1 -> s1.field(f -> f.field("createdAt").order(SortOrder.Desc)));
                        break;
                    case BEST_SELLING:
                        builder.sort(s1 -> s1.field(f -> f.field("soldCount").order(SortOrder.Desc)));
                        break;
                    case HIGHEST_RATED:
                        builder.sort(s1 -> s1.field(f -> f.field("rating").order(SortOrder.Desc)));
                        break;
                    case RELEVANCE:
                    default:
                        builder.sort(s1 -> s1.score(sc -> sc.order(SortOrder.Desc)));
                        break;
                }
            } else {
                builder.sort(s1 -> s1.score(sc -> sc.order(SortOrder.Desc)));
            }
            
            // Aggregations
            if (request.isIncludeAggregations()) {
                // Aggregation cho danh mục
                builder.aggregations("categories", a -> a
                        .terms(t -> t.field("categoryName").size(50)));
                
                // Aggregation cho khoảng giá
                builder.aggregations("price_ranges", a -> a
                        .range(t -> t
                                .field("price")
                                .ranges(
                                        AggregationRange.of(r -> r.to(500000.0)),
                                        AggregationRange.of(r -> r.from(500000.0).to(1000000.0)),
                                        AggregationRange.of(r -> r.from(1000000.0).to(2000000.0)),
                                        AggregationRange.of(r -> r.from(2000000.0).to(5000000.0)),
                                        AggregationRange.of(r -> r.from(5000000.0))
                                )
                        )
                );
                
                // Aggregation cho thuộc tính (nested)
                builder.aggregations("attributes", a -> a
                        .nested(n -> n.path("attributes"))
                        .aggregations("attribute_names", aa -> aa
                                .terms(t -> t.field("attributes.name").size(30))
                                .aggregations("attribute_values", aav -> aav
                                        .terms(t -> t.field("attributes.value").size(30)))));
            }
            
            return (co.elastic.clients.util.ObjectBuilder<SearchRequest>) builder.build();
        }, ProductDocument.class);
        
        // Chuyển đổi kết quả và lưu vào cache
        com.fourj.searchservice.dto.SearchResponse result = convertToSearchResponse(response, request, start);
        redisTemplate.opsForValue().set(cacheKey, result, 5, TimeUnit.MINUTES);
        
        return result;
    }
    
    /**
     * Xây dựng query dựa trên search request
     */
    private Query buildQuery(com.fourj.searchservice.dto.SearchRequest request) {
        BoolQuery.Builder boolQuery = new BoolQuery.Builder();
        
        // Must queries (phải thỏa mãn)
        if (StringUtils.hasText(request.getQuery())) {
            // Multi-match query cho full-text search
            boolQuery.must(MultiMatchQuery.of(m -> m
                    .query(request.getQuery())
                    .fields("name^10", "description^3", "categoryName^5", "attributes.displayName^2", "attributes.displayValue^2", "tags^4")
                    .type(TextQueryType.BestFields)
                    .operator(Operator.And)
                    .fuzziness("AUTO"))
                    ._toQuery());
        } else {
            // Nếu không có query text, trả về tất cả sản phẩm
            boolQuery.must(MatchAllQuery.of(m -> m)._toQuery());
        }
        
        // Filter queries (lọc kết quả)
        // Lọc theo danh mục
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            boolQuery.filter(TermsQuery.of(t -> t
                    .field("categoryName")
                    .terms(f -> f
                            .value(request.getCategories().stream()
                                    .map(FieldValue::of)
                                    .collect(Collectors.toList()))))
                    ._toQuery());
        }
        
        // Lọc theo khoảng giá
        PriceRange priceRange = request.getPriceRange();
        if (priceRange != null && (priceRange.getMin() != null || priceRange.getMax() != null)) {
            RangeQuery.Builder rq = (RangeQuery.Builder) new RangeQuery.Builder()
                    .number(nrq -> {
                        nrq.field("price")                                     // set the field name
                                .gte(priceRange.getMin().doubleValue());            // lower bound
                        if (priceRange.getMax() != null) {
                            nrq.lte(priceRange.getMax().doubleValue());          // upper bound
                        }
                        return nrq;
                    });

            boolQuery.filter(rq.build()._toQuery());
        }
        
        // Lọc theo thuộc tính
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            for (Map.Entry<String, List<String>> entry : request.getAttributes().entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                    NestedQuery nestedQuery = NestedQuery.of(n -> n
                            .path("attributes")
                            .query(BoolQuery.of(b -> b
                                    .must(TermQuery.of(t -> t
                                            .field("attributes.name")
                                            .value(entry.getKey()))
                                            ._toQuery())
                                    .must(TermsQuery.of(t -> t
                                            .field("attributes.value")
                                            .terms(f -> f
                                                    .value(entry.getValue().stream()
                                                            .map(FieldValue::of)
                                                            .collect(Collectors.toList()))))
                                            ._toQuery()))
                                    ._toQuery()));
                    
                    boolQuery.filter(nestedQuery._toQuery());
                }
            }
        }
        
        // Chỉ lấy các sản phẩm đang active
        boolQuery.filter(TermQuery.of(t -> t
                .field("active")
                .value(true))
                ._toQuery());
        
        // Chỉ lấy các sản phẩm còn hàng (nếu có giá trị inStock)
        boolQuery.filter(TermQuery.of(t -> t
                .field("inStock")
                .value(true))
                ._toQuery());
        
        return boolQuery.build()._toQuery();
    }
    
    /**
     * Chuyển đổi kết quả Elasticsearch sang DTO SearchResponse
     */
    private com.fourj.searchservice.dto.SearchResponse convertToSearchResponse(
            SearchResponse<ProductDocument> response,
            com.fourj.searchservice.dto.SearchRequest request,
            Instant startTime) {
        
        List<ProductDocument> products = response.hits().hits().stream()
                .map(Hit::source)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        Map<String, List<FacetEntry>> facets = new HashMap<>();
        
        // Xử lý facets nếu request yêu cầu và có kết quả aggregations
        if (request.isIncludeAggregations() && response.aggregations() != null) {
            // Xử lý category facets
            if (response.aggregations().containsKey("categories")) {
                facets.put("categories", new ArrayList<>());
                response.aggregations().get("categories").sterms().buckets().array()
                        .forEach(bucket -> {
                            facets.get("categories").add(
                                    FacetEntry.builder()
                                            .key(bucket.key().stringValue())
                                            .count(bucket.docCount())
                                            .build());
                        });
            }
            
            // Xử lý price_ranges facets
            if (response.aggregations().containsKey("price_ranges")) {
                facets.put("price_ranges", new ArrayList<>());
                response.aggregations().get("price_ranges").range().buckets().array()
                        .forEach(bucket -> {
                            String key = (bucket.from() != null ? bucket.from() : "0") + 
                                    "-" + 
                                    (bucket.to() != null ? bucket.to() : "∞");
                            facets.get("price_ranges").add(
                                    FacetEntry.builder()
                                            .key(key)
                                            .count(bucket.docCount())
                                            .build());
                        });
            }
            
            // Xử lý attribute facets (nested)
            if (response.aggregations().containsKey("attributes")) {
                response.aggregations().get("attributes").nested()
                        .aggregations().get("attribute_names").sterms().buckets().array()
                        .forEach(nameBucket -> {
                            String attrName = nameBucket.key().stringValue();
                            List<FacetEntry> valueFacets = new ArrayList<>();
                            
                            nameBucket.aggregations().get("attribute_values").sterms().buckets().array()
                                    .forEach(valueBucket -> {
                                        valueFacets.add(FacetEntry.builder()
                                                .key(valueBucket.key().stringValue())
                                                .count(valueBucket.docCount())
                                                .build());
                                    });
                            
                            facets.put("attr_" + attrName, valueFacets);
                        });
            }
        }
        
        // Tính thời gian thực thi
        Duration searchDuration = Duration.between(startTime, Instant.now());
        String searchTime = searchDuration.toMillis() + "ms";
        
        return com.fourj.searchservice.dto.SearchResponse.builder()
                .totalHits(response.hits().total().value())
                .products(products)
                .page(request.getFrom() / request.getSize())
                .size(request.getSize())
                .facets(facets)
                .searchTime(searchTime)
                .build();
    }
    
    /**
     * Tạo cache key từ search request
     */
    private String generateCacheKey(com.fourj.searchservice.dto.SearchRequest request) {
        return "search:" + 
                Objects.hashCode(request.getQuery()) + ":" +
                Objects.hashCode(request.getCategories()) + ":" +
                Objects.hashCode(request.getBrand()) + ":" +
                Objects.hashCode(request.getPriceRange()) + ":" + 
                Objects.hashCode(request.getAttributes()) + ":" +
                request.getSortOption() + ":" +
                request.getFrom() + ":" +
                request.getSize();
    }
    
    /**
     * Fallback method khi Elasticsearch không khả dụng
     */
    public com.fourj.searchservice.dto.SearchResponse searchProductsFallback(com.fourj.searchservice.dto.SearchRequest request, Exception ex) {
        log.error("Search fallback triggered due to: {}", ex.getMessage());
        
        return com.fourj.searchservice.dto.SearchResponse.builder()
                .totalHits(0)
                .products(Collections.emptyList())
                .page(request.getFrom() / request.getSize())
                .size(request.getSize())
                .facets(Collections.emptyMap())
                .searchTime("0ms")
                .build();
    }
    
    /**
     * Lấy suggestions cho auto-complete
     */
    @Cacheable(value = "suggestions", key = "#prefix")
    public List<String> getSuggestions(String prefix, int size) {
        try {
            String indexName = elasticsearchConfig.getIndexSettings().getProducts().getName();
            
            // Cấu hình cho completion suggesters
            Map<String, JsonData> completionSuggester = new HashMap<>();
            completionSuggester.put("field", JsonData.of("nameSuggest"));
            completionSuggester.put("skip_duplicates", JsonData.of(true));
            completionSuggester.put("size", JsonData.of(size));
            completionSuggester.put("prefix", JsonData.of(prefix));
            
            Map<String, JsonData> nameCompletionSuggester = new HashMap<>();
            nameCompletionSuggester.put("completion", JsonData.of(completionSuggester));
            
            Map<String, JsonData> suggesters = new HashMap<>();
            suggesters.put("name_suggest", JsonData.of(nameCompletionSuggester));
            
            // Tìm kiếm với completion suggesters
            SearchResponse<ProductDocument> response = client.search(s -> {
                SearchRequest.Builder builder = new SearchRequest.Builder();
                builder.index(indexName);
                builder.suggest((Suggester) suggesters);
                return (co.elastic.clients.util.ObjectBuilder<SearchRequest>) builder.build();
            }, ProductDocument.class);
            
            // Lấy completion suggestions
            if (response.suggest() != null && response.suggest().containsKey("name_suggest")) {
                return response.suggest().get("name_suggest").get(0).completion().options().stream()
                        .map(option -> option.text())
                        .collect(Collectors.toList());
            }
            
            // Nếu không có completion suggestions, thử dùng term suggester
            Map<String, JsonData> termSuggester = new HashMap<>();
            termSuggester.put("field", JsonData.of("name"));
            termSuggester.put("suggest_mode", JsonData.of("always"));
            termSuggester.put("text", JsonData.of(prefix));
            termSuggester.put("size", JsonData.of(size));
            
            Map<String, JsonData> nameTermSuggester = new HashMap<>();
            nameTermSuggester.put("term", JsonData.of(termSuggester));
            
            Map<String, JsonData> termSuggesters = new HashMap<>();
            termSuggesters.put("name_term", JsonData.of(nameTermSuggester));
            
            response = client.search(s -> {
                SearchRequest.Builder builder = new SearchRequest.Builder();
                builder.index(indexName);
                builder.suggest((Suggester) termSuggesters);
                return (co.elastic.clients.util.ObjectBuilder<SearchRequest>) builder.build();
            }, ProductDocument.class);
            
            if (response.suggest() != null && response.suggest().containsKey("name_term")) {
                return response.suggest().get("name_term").get(0).term().options().stream()
                        .map(option -> option.text())
                        .collect(Collectors.toList());
            }
            
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Error getting suggestions for prefix: {}", prefix, e);
            return Collections.emptyList();
        }
    }
} 
