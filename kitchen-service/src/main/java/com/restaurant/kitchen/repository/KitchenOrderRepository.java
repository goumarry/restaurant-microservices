package com.restaurant.kitchen.repository;

import com.restaurant.kitchen.entity.KitchenOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {
    List<KitchenOrder> findAllByOrderByReceivedAtDesc();
}
