package com.restaurant.delivery.messaging;

import com.restaurant.delivery.messaging.dto.DeliveryStatusEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeliveryEventPublisher {

    private final RabbitTemplate rabbit;

    public void publishStatus(Long orderId, Long deliveryId, String status) {
        rabbit.convertAndSend(RabbitMQConfig.DELIVERY_EXCHANGE, RabbitMQConfig.DELIVERY_STATUS_KEY,
                new DeliveryStatusEvent(orderId, deliveryId, status));
    }
}
