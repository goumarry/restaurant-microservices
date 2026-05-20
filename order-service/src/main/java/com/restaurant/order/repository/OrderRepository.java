package com.restaurant.order.repository;

import com.restaurant.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClientIdOrderByCreatedAtDesc(Long clientId);
    List<Order> findAllByOrderByCreatedAtDesc();
}
