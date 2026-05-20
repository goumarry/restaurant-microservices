package com.restaurant.order.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private String dishName;
    private Integer quantity;
    private Double price;
}
