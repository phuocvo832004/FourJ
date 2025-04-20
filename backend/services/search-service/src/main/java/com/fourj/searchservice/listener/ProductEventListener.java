package com.fourj.searchservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fourj.searchservice.document.ProductDocument;
import com.fourj.searchservice.service.ProductIndexingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.suggest.Completion;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventListener {

    private final ObjectMapper objectMapper;
    private final ProductIndexingService productIndexingService;
    
    private static final int BATCH_SIZE = 100;
    private List<ProductDocument> batchBuffer = new ArrayList<>(BATCH_SIZE);
    private CountDownLatch batchLatch = new CountDownLatch(BATCH_SIZE);
    
    @KafkaListener(topics = "${kafka.topics.product-events:product-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleProductEvent(String payload) {
        try {
            JsonNode eventNode = objectMapper.readTree(payload);
            String eventType = eventNode.path("eventType").asText();
            
            log.debug("Received product event: type={}", eventType);
            
            switch (eventType) {
                case "PRODUCT_CREATED":
                case "PRODUCT_UPDATED":
                    JsonNode productNode = eventNode.path("payload");
                    
                    // Chuyển đổi từ Product model sang ProductDocument
                    ProductDocument product = convertToProductDocument(productNode);
                    
                    if (product != null) {
                        handleProductCreateOrUpdate(product);
                    } else {
                        log.warn("Could not convert product payload for id: {}", 
                                eventNode.path("productId").asText());
                    }
                    break;
                    
                case "PRODUCT_DELETED":
                    String productId = eventNode.path("productId").asText();
                    productIndexingService.deleteProduct(productId);
                    break;
                    
                case "PRODUCT_BULK_UPDATED":
                    List<ProductDocument> products = new ArrayList<>();
                    JsonNode productsNode = eventNode.path("payload");
                    
                    if (productsNode.isArray()) {
                        for (JsonNode node : productsNode) {
                            ProductDocument doc = convertToProductDocument(node);
                            if (doc != null) {
                                products.add(doc);
                            }
                        }
                        
                        if (!products.isEmpty()) {
                            productIndexingService.bulkIndexProducts(products);
                        }
                    }
                    break;
                    
                default:
                    log.warn("Unknown event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing product event: {}", payload, e);
            // Cân nhắc gửi đến dead-letter-queue
        }
    }
    
    /**
     * Chuyển đổi từ Product model sang ProductDocument
     */
    private ProductDocument convertToProductDocument(JsonNode productNode) {
        try {
            Long id = productNode.path("id").asLong();
            String name = productNode.path("name").asText();
            
            ProductDocument document = ProductDocument.builder()
                    .id(String.valueOf(id))
                    .name(name)
                    .description(productNode.path("description").asText())
                    .price(productNode.has("price") ? 
                            new BigDecimal(productNode.path("price").asText()) : null)
                    .stockQuantity(productNode.path("stockQuantity").asInt())
                    .imageUrl(productNode.path("imageUrl").asText())
                    .categoryId(productNode.path("categoryId").asLong())
                    .categoryName(productNode.path("categoryName").asText())
                    .active(productNode.path("active").asBoolean(true))
                    .createdAt(productNode.has("createdAt") ? 
                            LocalDateTime.parse(productNode.path("createdAt").asText()) : LocalDateTime.now())
                    .updatedAt(productNode.has("updatedAt") ? 
                            LocalDateTime.parse(productNode.path("updatedAt").asText()) : LocalDateTime.now())
                    .inStock(productNode.path("stockQuantity").asInt() > 0)
                    .build();
            
            // Thêm completion cho search suggest
            Completion nameSuggest = new Completion(Collections.singletonList(name));
            document.setNameSuggest(nameSuggest);
            
            // Trích xuất attributes nếu có
            if (productNode.has("attributes") && productNode.path("attributes").isArray()) {
                List<ProductDocument.ProductAttribute> attributes = new ArrayList<>();
                
                for (JsonNode attrNode : productNode.path("attributes")) {
                    ProductDocument.ProductAttribute attribute = ProductDocument.ProductAttribute.builder()
                            .name(attrNode.path("name").asText())
                            .value(attrNode.path("value").asText())
                            .displayName(attrNode.path("name").asText()) // Dùng giá trị mặc định nếu không có displayName
                            .displayValue(attrNode.path("value").asText()) // Dùng giá trị mặc định nếu không có displayValue
                            .build();
                    
                    attributes.add(attribute);
                }
                
                document.setAttributes(attributes);
            }
            
            return document;
        } catch (Exception e) {
            log.error("Error converting product node to document", e);
            return null;
        }
    }
    
    /**
     * Xử lý tạo hoặc cập nhật sản phẩm
     * Tối ưu bằng cách gom nhóm các sản phẩm để bulk index
     */
    private synchronized void handleProductCreateOrUpdate(ProductDocument product) {
        try {
            // Thêm sản phẩm vào buffer
            batchBuffer.add(product);
            batchLatch.countDown();
            
            // Nếu buffer đầy hoặc countdown đã hoàn tất, thực hiện bulk index
            if (batchBuffer.size() >= BATCH_SIZE || batchLatch.getCount() == 0) {
                List<ProductDocument> batchToProcess = new ArrayList<>(batchBuffer);
                batchBuffer.clear();
                batchLatch = new CountDownLatch(BATCH_SIZE);
                
                productIndexingService.bulkIndexProducts(batchToProcess);
            }
        } catch (Exception e) {
            log.error("Error handling product create/update: {}", product.getId(), e);
            // Xử lý sản phẩm này đơn lẻ để tránh ảnh hưởng đến cả batch
            productIndexingService.indexProduct(product);
        }
    }
} 