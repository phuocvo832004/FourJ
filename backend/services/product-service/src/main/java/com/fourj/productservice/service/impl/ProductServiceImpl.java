package com.fourj.productservice.service.impl;

import com.fourj.productservice.dto.ProductAttributeDto;
import com.fourj.productservice.dto.ProductCreateDto;
import com.fourj.productservice.dto.ProductDto;
import com.fourj.productservice.dto.ProductUpdateDto;
import com.fourj.productservice.exception.ResourceNotFoundException;
import com.fourj.productservice.model.Category;
import com.fourj.productservice.model.Product;
import com.fourj.productservice.model.ProductAttribute;
import com.fourj.productservice.repository.CategoryRepository;
import com.fourj.productservice.repository.ProductAttributeRepository;
import com.fourj.productservice.repository.ProductRepository;
import com.fourj.productservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductAttributeRepository attributeRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              ProductAttributeRepository attributeRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.attributeRepository = attributeRepository;
    }

    @Override
    @Transactional
    public ProductDto createProduct(ProductCreateDto productCreateDto) {
        Category category = categoryRepository.findById(productCreateDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với id: " + productCreateDto.getCategoryId()));

        Product product = new Product();
        product.setName(productCreateDto.getName());
        product.setDescription(productCreateDto.getDescription());
        product.setPrice(productCreateDto.getPrice());
        product.setStockQuantity(productCreateDto.getStockQuantity());
        product.setImageUrl(productCreateDto.getImageUrl());
        product.setCategory(category);
        product.setActive(true);

        Product savedProduct = productRepository.save(product);

        // Lưu các thuộc tính sản phẩm
        if (productCreateDto.getAttributes() != null && !productCreateDto.getAttributes().isEmpty()) {
            for (ProductAttributeDto attributeDto : productCreateDto.getAttributes()) {
                ProductAttribute attribute = new ProductAttribute();
                attribute.setProduct(savedProduct);
                attribute.setName(attributeDto.getName());
                attribute.setValue(attributeDto.getValue());
                attributeRepository.save(attribute);
            }
        }

        return mapToDto(productRepository.findById(savedProduct.getId()).orElseThrow());
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại với id: " + id));
        return mapToDto(product);
    }

    @Override
    public Page<ProductDto> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(this::mapToDto);
    }

    @Override
    public Page<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Danh mục không tồn tại với id: " + categoryId);
        }
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable)
                .map(this::mapToDto);
    }

    @Override
    public Page<ProductDto> searchProducts(String keyword, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductUpdateDto productUpdateDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại với id: " + id));

        if (productUpdateDto.getName() != null) {
            product.setName(productUpdateDto.getName());
        }
        if (productUpdateDto.getDescription() != null) {
            product.setDescription(productUpdateDto.getDescription());
        }
        if (productUpdateDto.getPrice() != null) {
            product.setPrice(productUpdateDto.getPrice());
        }
        if (productUpdateDto.getStockQuantity() != null) {
            product.setStockQuantity(productUpdateDto.getStockQuantity());
        }
        if (productUpdateDto.getImageUrl() != null) {
            product.setImageUrl(productUpdateDto.getImageUrl());
        }
        if (productUpdateDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productUpdateDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại với id: " + productUpdateDto.getCategoryId()));
            product.setCategory(category);
        }
        if (productUpdateDto.getActive() != null) {
            product.setActive(productUpdateDto.getActive());
        }

        Product updatedProduct = productRepository.save(product);

        // Cập nhật thuộc tính nếu được cung cấp
        if (productUpdateDto.getAttributes() != null) {
            // Xóa thuộc tính cũ
            attributeRepository.deleteByProductId(id);

            // Thêm thuộc tính mới
            for (ProductAttributeDto attributeDto : productUpdateDto.getAttributes()) {
                ProductAttribute attribute = new ProductAttribute();
                attribute.setProduct(updatedProduct);
                attribute.setName(attributeDto.getName());
                attribute.setValue(attributeDto.getValue());
                attributeRepository.save(attribute);
            }
        }

        return mapToDto(productRepository.findById(updatedProduct.getId()).orElseThrow());
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại với id: " + id));

        // Soft delete - chỉ cập nhật trạng thái active
        product.setActive(false);
        productRepository.save(product);
    }

    private ProductDto mapToDto(Product product) {
        List<ProductAttribute> attributes = attributeRepository.findByProductId(product.getId());
        List<ProductAttributeDto> attributeDtos = attributes.stream()
                .map(attr -> new ProductAttributeDto(attr.getId(), attr.getName(), attr.getValue()))
                .collect(Collectors.toList());

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .attributes(attributeDtos)
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}