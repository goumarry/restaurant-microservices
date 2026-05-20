package com.restaurant.kitchen.messaging;

import com.restaurant.kitchen.messaging.dto.DishReadyEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KitchenEventPublisher {

    private final RabbitTemplate rabbit;

    public void publishDishReady(Long orderId) {
        rabbit.convertAndSend(RabbitMQConfig.DISH_EXCHANGE, RabbitMQConfig.DISH_READY_KEY, new DishReadyEvent(orderId));
    }
}
