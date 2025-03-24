package com.fourj.productservice.service.impl;

import com.fourj.productservice.dto.ProductImageRequest;
import com.fourj.productservice.entity.ProductImage;
import com.fourj.productservice.repository.ProductImageRepository;
import com.fourj.productservice.service.ProductImageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final String uploadDir = "uploads/products";

    @Override
    @Transactional
    public ProductImage uploadImage(ProductImageRequest request) {
        try {
            MultipartFile file = request.getImageFile();
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            ProductImage productImage = ProductImage.builder()
                    .productId(request.getProductId())
                    .imageUrl("/uploads/products/" + fileName)
                    .isPrimary(request.isPrimary())
                    .build();

            return productImageRepository.save(productImage);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductImage> getProductImages(Long productId) {
        return productImageRepository.findByProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductImage getPrimaryImage(Long productId) {
        return productImageRepository.findByProductIdAndIsPrimaryTrue(productId);
    }

    @Override
    @Transactional
    public void deleteImage(Long id) {
        ProductImage image = productImageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Image not found"));

        try {
            Path filePath = Paths.get(uploadDir, image.getImageUrl().substring(image.getImageUrl().lastIndexOf("/") + 1));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image file", e);
        }

        productImageRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteProductImages(Long productId) {
        List<ProductImage> images = productImageRepository.findByProductId(productId);
        for (ProductImage image : images) {
            deleteImage(image.getId());
        }
    }
} 