package com.restaurant.order.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchanges
    public static final String ORDER_EXCHANGE    = "order.exchange";
    public static final String DISH_EXCHANGE     = "dish.exchange";
    public static final String DELIVERY_EXCHANGE = "delivery.exchange";

    // Routing keys
    public static final String ORDER_CREATED_KEY  = "order.created";
    public static final String DISH_READY_KEY     = "dish.ready";
    public static final String DELIVERY_STATUS_KEY = "delivery.status";

    // Queues consumed by order-service
    public static final String DISH_READY_ORDER_QUEUE     = "dish.ready.order.queue";
    public static final String DELIVERY_STATUS_ORDER_QUEUE = "delivery.status.order.queue";

    @Bean TopicExchange orderExchange()    { return new TopicExchange(ORDER_EXCHANGE); }
    @Bean TopicExchange dishExchange()     { return new TopicExchange(DISH_EXCHANGE); }
    @Bean TopicExchange deliveryExchange() { return new TopicExchange(DELIVERY_EXCHANGE); }

    @Bean Queue dishReadyOrderQueue()          { return QueueBuilder.durable(DISH_READY_ORDER_QUEUE).build(); }
    @Bean Queue deliveryStatusOrderQueue()     { return QueueBuilder.durable(DELIVERY_STATUS_ORDER_QUEUE).build(); }

    @Bean Binding dishReadyOrderBinding()      { return BindingBuilder.bind(dishReadyOrderQueue()).to(dishExchange()).with(DISH_READY_KEY); }
    @Bean Binding deliveryStatusOrderBinding() { return BindingBuilder.bind(deliveryStatusOrderQueue()).to(deliveryExchange()).with(DELIVERY_STATUS_KEY); }

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
