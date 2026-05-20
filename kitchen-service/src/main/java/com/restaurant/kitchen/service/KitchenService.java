package com.restaurant.kitchen.service;

import com.restaurant.kitchen.entity.DishStatus;
import com.restaurant.kitchen.entity.KitchenOrder;
import com.restaurant.kitchen.messaging.KitchenEventPublisher;
import com.restaurant.kitchen.repository.KitchenOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final KitchenOrderRepository repo;
    private final KitchenEventPublisher publisher;

    public List<KitchenOrder> findAll() {
        return repo.findAllByOrderByReceivedAtDesc();
    }

    public KitchenOrder updateStatus(Long id, String status) {
        KitchenOrder ko = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Commande cuisine introuvable"));
        ko.setStatus(DishStatus.valueOf(status));
        KitchenOrder saved = repo.save(ko);
        if (DishStatus.READY.name().equals(status)) {
            publisher.publishDishReady(ko.getOrderId());
        }
        return saved;
    }
}
