package com.fourj.searchservice.dto;

import com.fourj.searchservice.document.ProductDocument;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class SearchResponse {
    private long totalHits;
    private int page;
    private int size;
    private List<ProductDocument> products;
    private List<String> suggestedTerms;
    private Map<String, List<FacetEntry>> facets;
    private String searchTime;

    @Data
    @Builder
    public static class FacetEntry {
        private String key;
        private long count;
    }
}