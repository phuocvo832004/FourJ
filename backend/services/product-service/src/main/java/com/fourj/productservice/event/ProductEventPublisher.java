package com.fourj.productservice.event;

import com.fourj.productservice.dto.ProductDto;
import com.fourj.productservice.event.dto.ProductEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * Service để phát sự kiện Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductEventPublisher {

    private final KafkaTemplate<String, ProductEventDto> kafkaTemplate;

    @Value("${kafka.topics.product-events:product-events}")
    private String productEventsTopic;

    /**
     * Phát sự kiện sản phẩm được tạo
     */
    public void publishProductCreated(ProductDto productDto) {
        publishEvent("PRODUCT_CREATED", productDto);
    }

    /**
     * Phát sự kiện sản phẩm được cập nhật
     */
    public void publishProductUpdated(ProductDto productDto) {
        publishEvent("PRODUCT_UPDATED", productDto);
    }

    /**
     * Phát sự kiện sản phẩm bị xóa
     */
    public void publishProductDeleted(String productId) {
        ProductEventDto event = ProductEventDto.builder()
                .eventType("PRODUCT_DELETED")
                .productId(productId)
                .build();

        try {
            kafkaTemplate.send(productEventsTopic, productId, event);
            log.info("Published PRODUCT_DELETED event for product ID: {}", productId);
        } catch (Exception e) {
            log.error("Failed to publish PRODUCT_DELETED event for product ID: {}", productId, e);
        }
    }

    /**
     * Phương thức chung để phát sự kiện
     */
    private void publishEvent(String eventType, ProductDto productDto) {
        ProductEventDto event = ProductEventDto.builder()
                .eventType(eventType)
                .productId(productDto.getId().toString())
                .payload(productDto)
                .build();

        try {
            kafkaTemplate.send(productEventsTopic, productDto.getId().toString(), event);
            log.info("Published {} event for product: {}", eventType, productDto.getId());
        } catch (Exception e) {
            log.error("Failed to publish {} event for product: {}", eventType, productDto.getId(), e);
        }
    }
} 