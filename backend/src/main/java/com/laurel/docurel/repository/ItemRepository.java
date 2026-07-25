package com.laurel.docurel.repository;

import  org.springframework.data.jpa.repository.JpaRepository;

import com.laurel.docurel.entity.ItemEntity;

/* this repo is attached to the same table("items") that ItemEntity is attached to,
   Spring creates basic methods and implentations for querying that table automatically */
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {}
