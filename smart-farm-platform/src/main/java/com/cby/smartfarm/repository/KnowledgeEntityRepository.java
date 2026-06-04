package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.KnowledgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeEntityRepository extends JpaRepository<KnowledgeEntity, Long> {

    Optional<KnowledgeEntity> findByNameAndType(String name, String type);

    List<KnowledgeEntity> findByType(String type);

    @Query(value = """
            SELECT * FROM kg_entity e
            WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(e.type) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(e.aliases) LIKE LOWER(CONCAT('%', :keyword, '%'))
            LIMIT 12
            """, nativeQuery = true)
    List<KnowledgeEntity> search(@Param("keyword") String keyword);
}
