package com.restaurant.kitchen.controller;

import com.restaurant.kitchen.entity.KitchenOrder;
import com.restaurant.kitchen.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService service;

    @GetMapping("/orders")
    public ResponseEntity<List<KitchenOrder>> all() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<KitchenOrder> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }
}
