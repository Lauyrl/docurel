package com.laurel.docurel.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.entity.ItemWithMetaDataRecord;
import com.laurel.docurel.entity.UserEntity;
import com.laurel.docurel.entity.UserItemEntity;
import com.laurel.docurel.enums.PermissionType;

public interface UserItemRepository extends JpaRepository<UserItemEntity, Long> {

    public Optional<UserItemEntity> findByUserAndItem(UserEntity user, ItemEntity item);

    @Query("""
       SELECT u
       FROM UserEntity u
       JOIN UserItemEntity ui ON ui.user = u 
       WHERE ui.item.publicId = :publicId
         AND ui.permission = :permission
    """)
    Optional<UserEntity> findByItemPublicIdAndPermission(UUID publicId, PermissionType permission);

    @Modifying(clearAutomatically = true)
    @Query("""
        DELETE FROM UserItemEntity ui
        WHERE ui.user = :user AND ui.item IN (:items) 
    """)
    public void deleteByUserAndItems(UserEntity user, List<ItemEntity> items);

    @Query("""
        SELECT ui 
        FROM UserItemEntity ui
        WHERE ui.item IN (:items)
        AND ui.permission IS NOT NULL
    """)
    public List<UserItemEntity> findByItemsExceptNullPermission(List<ItemEntity> items);

    @Query(value = """
        SELECT new com.laurel.docurel.entity.ItemWithMetaDataRecord(ui.item, ui.permission, ui.lastOpened, ui.starred)
        FROM UserItemEntity ui
        WHERE ui.user = :user
        AND ui.permission = 'OWNER'
    """)
    public List<ItemWithMetaDataRecord> findItemsOwnedByUser(UserEntity user);

    // added NOT NULL condition after last_opened-related features allowed pure metadata rows with NULL permissions to be added
    @Query(value = """
        SELECT *
        FROM user_items ui
        WHERE ui.user_id = :userId
          AND ui.permission != 'OWNER'
          AND ui.permission IS NOT NULL
    """, nativeQuery = true)
    public List<UserItemEntity> findByUserExceptOwnedOrNullPermission(@Param("userId") Long userId);
    
    @Query(value = """
        WITH RECURSIVE shared AS (
            SELECT i.*
            FROM items i
            JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :current_user_id
            WHERE ui.permission IS NOT NULL AND ui.permission != 'OWNER' AND ui.permission != 'NO_PERMISSION'

            UNION ALL

            SELECT i.*
            FROM items i
            JOIN shared s ON i.parent_id = s.id
            LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :current_user_id
            WHERE ui.permission IS NULL OR ui.permission != 'NO_PERMISSION'
        )
        SELECT DISTINCT i.id, ui.permission, ui.last_opened, COALESCE(ui.starred, false)
        FROM shared i
        LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :current_user_id          
    """, nativeQuery = true) // add SELECT DISTINCT for items whom multiple ancestors have entries 
    public List<Object[]> findAccessibleItemsExceptOwnedByUserId(@Param("current_user_id") Long userId); // includes items without explicit entries, but inherited permissions

    @Query(value = """
        WITH RECURSIVE shared AS (
            SELECT i.*
            FROM items i
            JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :current_user_id
            WHERE ui.starred 
              AND (ui.permission IS NULL OR ui.permission != 'NO_PERMISSION') ---- only accessible items can be starred, and if parent loses permission, descendants lose entry, so this is fine
              AND i.parent_id != 0

            UNION ALL

            SELECT i.*
            FROM items i
            JOIN shared s ON i.parent_id = s.id
            LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :current_user_id
            WHERE ui.permission IS NULL OR ui.permission != 'NO_PERMISSION'
        )
        SELECT DISTINCT i.id, ui.permission, ui.last_opened, COALESCE(ui.starred, false)
        FROM shared i
        LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :current_user_id          
    """, nativeQuery = true) // add SELECT DISTINCT for items whom multiple ancestors have entries 
    public List<Object[]> findStarredAndDescendants(@Param("current_user_id") Long userId);
}
