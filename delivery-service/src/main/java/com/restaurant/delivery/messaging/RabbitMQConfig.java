package com.restaurant.delivery.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String DISH_EXCHANGE        = "dish.exchange";
    public static final String DELIVERY_EXCHANGE    = "delivery.exchange";
    public static final String DISH_READY_KEY       = "dish.ready";
    public static final String DELIVERY_STATUS_KEY  = "delivery.status";

    // Queue consumed by delivery-service
    public static final String DISH_READY_DELIVERY_QUEUE = "dish.ready.delivery.queue";

    @Bean TopicExchange dishExchange()     { return new TopicExchange(DISH_EXCHANGE); }
    @Bean TopicExchange deliveryExchange() { return new TopicExchange(DELIVERY_EXCHANGE); }

    @Bean Queue dishReadyDeliveryQueue() { return QueueBuilder.durable(DISH_READY_DELIVERY_QUEUE).build(); }

    @Bean Binding dishReadyDeliveryBinding() {
        return BindingBuilder.bind(dishReadyDeliveryQueue()).to(dishExchange()).with(DISH_READY_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(jsonConverter());
        return t;
    }
}
