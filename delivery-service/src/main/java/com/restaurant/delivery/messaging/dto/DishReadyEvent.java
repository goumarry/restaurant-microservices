package com.restaurant.delivery.messaging.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DishReadyEvent {
    private Long orderId;
}
