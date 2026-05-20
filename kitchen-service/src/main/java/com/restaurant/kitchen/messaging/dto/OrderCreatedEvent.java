package com.restaurant.kitchen.messaging.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class OrderCreatedEvent {
    private Long orderId;
    private Long clientId;
    private String clientEmail;
    private List<String> dishNames;
}
