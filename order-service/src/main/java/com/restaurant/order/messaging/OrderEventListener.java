package com.restaurant.order.messaging;

import com.restaurant.order.entity.Order;
import com.restaurant.order.entity.OrderStatus;
import com.restaurant.order.messaging.dto.DeliveryStatusEvent;
import com.restaurant.order.messaging.dto.DishReadyEvent;
import com.restaurant.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final OrderRepository repo;

    @RabbitListener(queues = RabbitMQConfig.DISH_READY_ORDER_QUEUE)
    public void onDishReady(DishReadyEvent event) {
        log.info("Plat prêt pour commande #{}", event.getOrderId());
        repo.findById(event.getOrderId()).ifPresent(order -> {
            order.setStatus(OrderStatus.READY);
            repo.save(order);
        });
    }

    @RabbitListener(queues = RabbitMQConfig.DELIVERY_STATUS_ORDER_QUEUE)
    public void onDeliveryStatus(DeliveryStatusEvent event) {
        log.info("Statut livraison commande #{} : {}", event.getOrderId(), event.getStatus());
        repo.findById(event.getOrderId()).ifPresent(order -> {
            try {
                order.setStatus(OrderStatus.valueOf(event.getStatus()));
                repo.save(order);
            } catch (IllegalArgumentException ignored) {}
        });
    }
}
