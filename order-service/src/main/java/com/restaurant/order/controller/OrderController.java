package com.restaurant.order.controller;

import com.restaurant.order.dto.CreateOrderRequest;
import com.restaurant.order.entity.Order;
import com.restaurant.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @PostMapping
    public ResponseEntity<Order> create(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestBody CreateOrderRequest req) {
        return ResponseEntity.ok(service.create(userId, userEmail, req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> myOrders(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.findByClient(userId));
    }

    @GetMapping
    public ResponseEntity<List<Order>> all() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
