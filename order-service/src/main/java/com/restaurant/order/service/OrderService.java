package com.restaurant.order.service;

import com.restaurant.order.dto.CreateOrderRequest;
import com.restaurant.order.entity.Order;
import com.restaurant.order.entity.OrderItem;
import com.restaurant.order.messaging.OrderEventPublisher;
import com.restaurant.order.messaging.dto.OrderCreatedEvent;
import com.restaurant.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repo;
    private final OrderEventPublisher publisher;

    public Order create(Long clientId, String clientEmail, CreateOrderRequest req) {
        Order order = new Order();
        order.setClientId(clientId);
        order.setClientEmail(clientEmail);

        List<OrderItem> items = req.getItems().stream().map(r -> {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setDishName(r.getDishName());
            item.setQuantity(r.getQuantity());
            item.setPrice(r.getPrice());
            return item;
        }).toList();

        order.setItems(items);
        Order saved = repo.save(order);

        List<String> dishNames = items.stream().map(OrderItem::getDishName).toList();
        publisher.publishOrderCreated(new OrderCreatedEvent(saved.getId(), clientId, clientEmail, dishNames));

        return saved;
    }

    public List<Order> findByClient(Long clientId) {
        return repo.findByClientIdOrderByCreatedAtDesc(clientId);
    }

    public List<Order> findAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public Order findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Commande introuvable"));
    }
}
