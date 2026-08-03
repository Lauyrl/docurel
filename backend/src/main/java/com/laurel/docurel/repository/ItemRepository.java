package com.laurel.docurel.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.laurel.docurel.entity.ItemEntity;

/* this repo is attached to the same table("items") that ItemEntity is attached to,
   Spring creates basic methods and implentations for querying that table automatically */
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {

    Optional<ItemEntity> findByPublicId(UUID publicId);

    boolean existsByParentIdAndName(Long parentId, String name);

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
}
