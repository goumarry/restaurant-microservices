package com.restaurant.kitchen.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE   = "order.exchange";
    public static final String DISH_EXCHANGE    = "dish.exchange";
    public static final String ORDER_CREATED_KEY = "order.created";
    public static final String DISH_READY_KEY   = "dish.ready";

    // Queue consumed by kitchen-service
    public static final String ORDER_CREATED_KITCHEN_QUEUE = "order.created.kitchen.queue";

    @Bean TopicExchange orderExchange() { return new TopicExchange(ORDER_EXCHANGE); }
    @Bean TopicExchange dishExchange()  { return new TopicExchange(DISH_EXCHANGE); }

    @Bean Queue orderCreatedKitchenQueue() { return QueueBuilder.durable(ORDER_CREATED_KITCHEN_QUEUE).build(); }

    @Bean Binding orderCreatedKitchenBinding() {
        return BindingBuilder.bind(orderCreatedKitchenQueue()).to(orderExchange()).with(ORDER_CREATED_KEY);
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
