package com.restaurant.kitchen.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_orders")
@Data
@NoArgsConstructor
public class KitchenOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private String clientEmail;

    @Column(columnDefinition = "TEXT")
    private String dishes;

    @Enumerated(EnumType.STRING)
    private DishStatus status = DishStatus.PENDING;

    private LocalDateTime receivedAt = LocalDateTime.now();
}
