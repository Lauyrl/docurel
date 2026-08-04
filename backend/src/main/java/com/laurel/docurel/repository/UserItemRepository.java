package com.laurel.docurel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.entity.UserItemEntity;

public interface UserItemRepository extends JpaRepository<UserItemEntity, Long> {
    
    public Optional<UserItemEntity> findByUserIdAndItemId(Long userId, Long itemId);

    @Query(value = """
        SELECT ui.item
        FROM UserItemEntity ui
        WHERE ui.user = :user        
    """)
    public List<ItemEntity> findItemsByUser(UserEntity user);

    @Query(value = """
        SELECT ui
        FROM UserItemEntity ui
        WHERE ui.item = :item        
    """)
    public List<UserItemEntity> findByItem(ItemEntity item);

    @Query(value = """
        SELECT ui.item
        FROM UserItemEntity ui
        WHERE ui.user = :user 
          AND ui.item.parentId = :globalRootId        
    """)
    public Optional<ItemEntity> findUserRootItemByUser(UserEntity user, Long globalRootId);
}
