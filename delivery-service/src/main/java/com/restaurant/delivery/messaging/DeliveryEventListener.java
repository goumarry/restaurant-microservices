package com.restaurant.delivery.messaging;

import com.restaurant.delivery.entity.Delivery;
import com.restaurant.delivery.messaging.dto.DishReadyEvent;
import com.restaurant.delivery.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryEventListener {

    private final DeliveryRepository repo;

    @RabbitListener(queues = RabbitMQConfig.DISH_READY_DELIVERY_QUEUE)
    public void onDishReady(DishReadyEvent event) {
        log.info("Plat prêt, création livraison pour commande #{}", event.getOrderId());
        Delivery delivery = new Delivery();
        delivery.setOrderId(event.getOrderId());
        repo.save(delivery);
    }
}
