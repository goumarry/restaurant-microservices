package com.restaurant.delivery.controller;

import com.restaurant.delivery.entity.Delivery;
import com.restaurant.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService service;

    @GetMapping
    public ResponseEntity<List<Delivery>> all() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, userId, body.get("status")));
    }
}
