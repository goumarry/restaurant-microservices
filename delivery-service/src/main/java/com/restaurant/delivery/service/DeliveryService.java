package com.restaurant.delivery.service;

import com.restaurant.delivery.entity.Delivery;
import com.restaurant.delivery.entity.DeliveryStatus;
import com.restaurant.delivery.messaging.DeliveryEventPublisher;
import com.restaurant.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository repo;
    private final DeliveryEventPublisher publisher;

    public List<Delivery> findAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public Delivery updateStatus(Long id, Long livreurId, String status) {
        Delivery delivery = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Livraison introuvable"));

        DeliveryStatus newStatus = DeliveryStatus.valueOf(status);
        delivery.setStatus(newStatus);
        delivery.setUpdatedAt(LocalDateTime.now());

        if (newStatus == DeliveryStatus.IN_TRANSIT && delivery.getLivreurId() == null) {
            delivery.setLivreurId(livreurId);
        }

        Delivery saved = repo.save(delivery);
        publisher.publishStatus(delivery.getOrderId(), delivery.getId(), status);
        return saved;
    }
}
