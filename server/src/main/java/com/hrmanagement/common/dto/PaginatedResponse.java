package com.hrmanagement.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {
    private List<T> data;
    private Meta meta;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Meta {
        private int page;
        private int limit;
        private long total;
    }

    public static <T> PaginatedResponse<T> of(List<T> data, int page, int limit, long total) {
        return new PaginatedResponse<>(data, new Meta(page, limit, total));
    }
}
