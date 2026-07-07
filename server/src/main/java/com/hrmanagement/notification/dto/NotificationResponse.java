package com.hrmanagement.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    @JsonProperty("id")
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private String relatedId;
    private String relatedModel;
    private Boolean isRead;
    @JsonProperty("createdAt")
    private Instant createdAt;
}
