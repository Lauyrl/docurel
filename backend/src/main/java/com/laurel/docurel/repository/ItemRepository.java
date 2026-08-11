package com.laurel.docurel.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.laurel.docurel.entity.ItemEntity;
import com.laurel.docurel.entity.ItemLastOpenedRecord;
import com.laurel.docurel.enums.PermissionType;

/* this repo is attached to the same table("items") that ItemEntity is attached to,
   Spring creates basic methods and implentations for querying that table automatically */
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {

    Optional<ItemEntity> findByPublicId(UUID publicId);

    boolean existsByParentIdAndName(Long parentId, String name);

    @Query("""
        SELECT j.publicId
        FROM ItemEntity i
        JOIN ItemEntity j
          ON i.parentId = j.id
        WHERE i.publicId = :publicId
    """)
    UUID findPublicParentIdByPublicId(@Param("publicId") UUID publicId);

    @Query("SELECT i.id FROM ItemEntity i WHERE i.publicId = :publicId")
    Long findIdByPublicId(@Param("publicId") UUID publicId);

    @Query("SELECT i.publicId FROM ItemEntity i WHERE i.id = :id")
    UUID findPublicIdById(@Param("id") Long id);

    @Query("SELECT i.name FROM ItemEntity i WHERE i.publicId = :publicId")
    String findNameByPublicId(@Param("publicId") UUID publicId);

    @Query("SELECT i.contentType FROM ItemEntity i WHERE i.publicId = :publicId")
    String findContentTypeByPublicId(@Param("publicId") UUID publicId);

    List<ItemEntity> findByParentId(Long parentId);

    @Query(value = """
        WITH RECURSIVE all_items AS (
            SELECT i.*
            FROM items i
            JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :userId
            WHERE ui.permission IS NOT NULL AND ui.permission != 'NO_PERMISSION'

            UNION

            SELECT i.*
            FROM items i
            JOIN all_items s ON i.parent_id = s.id
            LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :userId
            WHERE ui.permission IS NULL OR ui.permission != 'NO_PERMISSION'
        )

        SELECT i.public_id
        FROM all_items i
        LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :userId
        WHERE (
            (:ownedOnly AND ui.permission = 'OWNER') OR 
            (NOT :ownedOnly AND 
                (ui.permission IS NULL OR ui.permission IN ('VIEWER', 'SHARER', 'EDITOR'))
            )
        )
          AND i.parent_id != 0
          AND (:query                              IS NULL OR similarity(i.name, :query) > 0.25)
          AND (CAST(:type AS item_type)            IS NULL OR i.type         = CAST(:type AS item_type))
          AND (:contentType                        IS NULL OR i.content_type = :contentType)
          AND (CAST(:createdAfter  AS TIMESTAMPTZ) IS NULL OR i.created_at  >= :createdAfter)
          AND (CAST(:createdBefore AS TIMESTAMPTZ) IS NULL OR i.created_at  <= :createdBefore)
          AND (CAST(:updatedAfter  AS TIMESTAMPTZ) IS NULL OR i.updated_at  >= :updatedAfter)
          AND (CAST(:updatedBefore AS TIMESTAMPTZ) IS NULL OR i.updated_at  <= :updatedBefore)
        ORDER BY
            CASE WHEN (:descending AND :sortBy = 'Name similarity' AND :query IS NOT NULL) THEN similarity(i.name, :query) ELSE NULL END DESC,
            CASE WHEN (:descending AND :sortBy = 'Alphabetical') THEN i.name       ELSE NULL END DESC,
            CASE WHEN (:descending AND :sortBy = 'Size')         THEN i.size_bytes ELSE NULL END DESC,
            CASE WHEN (:descending AND :sortBy = 'Date created') THEN i.created_at ELSE NULL END DESC,
            CASE WHEN (:descending AND :sortBy = 'Date updated') THEN i.updated_at ELSE NULL END DESC, 
            
            CASE WHEN (NOT :descending AND :sortBy = 'Name similarity' AND :query IS NOT NULL) THEN similarity(i.name, :query) ELSE NULL END ASC,
            CASE WHEN (NOT :descending AND :sortBy = 'Alphabetical') THEN i.name       ELSE NULL END ASC,
            CASE WHEN (NOT :descending AND :sortBy = 'Size')         THEN i.size_bytes ELSE NULL END ASC,
            CASE WHEN (NOT :descending AND :sortBy = 'Date created') THEN i.created_at ELSE NULL END ASC,
            CASE WHEN (NOT :descending AND :sortBy = 'Date updated') THEN i.updated_at ELSE NULL END ASC,

            CASE WHEN (:query IS NOT NULL) THEN similarity(i.name, :query) ELSE NULL END DESC,
            i.updated_at DESC
        LIMIT 100
    """, nativeQuery = true)
    List<UUID> findMatchingItemsPublicId(
        @Param("userId") Long userId, 
        @Param("ownedOnly") boolean ownedOnly,
        @Param("query") String query,
        @Param("type") String type,
        @Param("contentType") String contentType,
        @Param("createdAfter") Instant createdAfter,
        @Param("createdBefore") Instant createdBefore,
        @Param("updatedAfter") Instant updatedAfter,
        @Param("updatedBefore") Instant updatedBefore,
        @Param("sortBy") String sortBy,
        @Param("descending") boolean descending
    );

    @Query(value = """
        WITH RECURSIVE family AS (
            SELECT id, parent_id
            FROM items
            WHERE id = :potentialAncestorId

            UNION ALL

            SELECT i.id, i.parent_id
            FROM items i
            JOIN family f ON i.parent_id = f.id
        )
        SELECT EXISTS (
            SELECT 1 
            FROM family
            WHERE id = :potentialDescendantId
        )
    """, nativeQuery = true)
    public boolean isDescendant(Long potentialAncestorId, Long potentialDescendantId); 

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM ItemEntity i WHERE i.id = :id")
    void deleteById(@Param("id") Long id);

    @Query(value = """
        WITH RECURSIVE path AS (
            -----initial entry added to the recursive 'path' table
            SELECT
                id,
                parent_id,
                name,
                0 AS depth
            FROM items
            WHERE id = :destId     -----:destId indicates a parameter named "destId" that will be passed to this query

            UNION ALL

            -----UNION to the 'path' table ('p'), the entry ('i') where: i.id = p.parent_id
            -----during each iteration, the *working version* of 'path' only contains the rows added during the previous iteration
            SELECT
                i.id,
                i.parent_id,
                i.name,
                p.depth + 1
            FROM items i
            JOIN path p ON i.id = p.parent_id
        )
        -----'aggregates' the name values (ordered by descending 'depth' so that higher dirs end up first) with '/' as a delimiter
        SELECT STRING_AGG(name, '/' ORDER BY depth DESC)
        FROM path;
    """, nativeQuery = true)
    public String getPath(@Param("destId") Long destId);
    
    @Query(value = """
        WITH RECURSIVE path AS (
            SELECT *, 0 AS depth
            FROM items
            WHERE public_id = :publicDestId

            UNION ALL

            SELECT i.*, p.depth + 1
            FROM items i
            JOIN path p ON i.id = p.parent_id
        )
        SELECT id, parent_id, name, type, size_bytes, content_type, created_at, updated_at, public_id 
        FROM path
        ORDER BY depth ASC
    """, nativeQuery = true)
    public List<ItemEntity> findItemsOnPath(@Param("publicDestId") UUID publicDestId);

    @Query(value = """
        WITH RECURSIVE tree AS (
            SELECT *
            FROM items
            WHERE public_id = :publicRootId

            UNION ALL

            SELECT i.*
            FROM items i
            JOIN tree t ON i.parent_id = t.id
        )
        SELECT * FROM tree
    """, nativeQuery = true)
    public List<ItemEntity> findSelfAndDescendants(@Param("publicRootId") UUID publicRootId);

    @Query(value = """
        WITH RECURSIVE first_permission AS (
            SELECT i.*, ui.permission
            FROM items i
            LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :userId
            WHERE i.id = :itemId

            UNION ALL
        
            SELECT i.*, ui.permission
            FROM items i
            JOIN first_permission p ON i.id = p.parent_id 
            LEFT JOIN user_items ui ON i.id = ui.item_id AND ui.user_id = :userId
            WHERE p.permission IS NULL      --- if the working table contains an item with a permission entry, this condition becomes false, 
                                            --- and nothing can be added on this iteration, working table becomes empty and recursion stops 
        )
        SELECT permission FROM first_permission
        WHERE permission IS NOT NULL
        LIMIT 1
    """, nativeQuery = true)
    public PermissionType findFirstPermissionOnPath(@Param("itemId") Long itemId, @Param("userId") Long userId);

    @Query(value = """
        WITH RECURSIVE tree AS (
            SELECT id, type
            FROM items
            WHERE id = :rootId

            UNION ALL

            SELECT i.id, i.type
            FROM items i
            JOIN tree t ON i.parent_id = t.id
        )
        SELECT id FROM tree WHERE type != 'FOLDER';        
    """, nativeQuery = true)
    List<Long> findDocumentIdsByAncestorId(@Param("rootId") Long rootId); // inclusive of ancestor/root

    @Query(value = """
        SELECT i.*, ui.permission, ui.last_opened
        FROM items i
        JOIN user_items ui ON i.id = ui.item_id
        WHERE ui.user_id = :userId
          AND i.type != 'FOLDER'
          AND ui.last_opened IS NOT NULL
        ORDER BY ui.last_opened DESC
        LIMIT 1000  
    """, nativeQuery = true)
    List<ItemLastOpenedRecord> findRecents(@Param("userId") Long userId);
}
