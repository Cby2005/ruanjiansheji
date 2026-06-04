package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {

    @Query(value = """
            SELECT * FROM kg_chunk c
            WHERE LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(c.keywords) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR c.entity_ids LIKE CONCAT('%', :entityToken, '%')
            LIMIT 8
            """, nativeQuery = true)
    List<KnowledgeChunk> search(@Param("keyword") String keyword, @Param("entityToken") String entityToken);
}
