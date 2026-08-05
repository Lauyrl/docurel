package com.laurel.docurel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
        WHERE ui.user = :user
          AND ui.permission != com.laurel.docurel.enums.PermissionType.OWNER
    """)
    public List<UserItemEntity> findByUserExceptOwned(UserEntity user);

    @Query(value = """
        WITH RECURSIVE shared AS (
            SELECT i.*
            FROM items i
            JOIN user_items ui
              ON i.id = ui.item_id
            WHERE ui.user_id = :current_user_id
              AND ui.permission != 'OWNER'

            UNION ALL

            SELECT i.*
            FROM items i
            JOIN shared s
              ON i.parent_id = s.id
        )
        SELECT DISTINCT * FROM shared              
    """, nativeQuery = true) // add SELECT DISTINCT for items whom multiple ancestors have entries 
    public List<ItemEntity> findAccessibleItemsExceptOwnedByUserId(@Param("current_user_id") Long userId); // includes items without explicit entries, but inherited permissions

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
