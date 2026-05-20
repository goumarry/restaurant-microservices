package com.restaurant.kitchen.messaging;

import com.restaurant.kitchen.entity.KitchenOrder;
import com.restaurant.kitchen.messaging.dto.OrderCreatedEvent;
import com.restaurant.kitchen.repository.KitchenOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class KitchenEventListener {

    private final KitchenOrderRepository repo;

    @RabbitListener(queues = RabbitMQConfig.ORDER_CREATED_KITCHEN_QUEUE)
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Nouvelle commande reçue en cuisine : #{}", event.getOrderId());
        KitchenOrder ko = new KitchenOrder();
        ko.setOrderId(event.getOrderId());
        ko.setClientEmail(event.getClientEmail());
        ko.setDishes(String.join(", ", event.getDishNames()));
        repo.save(ko);
    }
}
