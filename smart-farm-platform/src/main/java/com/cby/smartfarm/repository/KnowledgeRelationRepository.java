package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.KnowledgeRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeRelationRepository extends JpaRepository<KnowledgeRelation, Long> {

    List<KnowledgeRelation> findBySourceIdInOrTargetIdIn(List<Long> sourceIds, List<Long> targetIds);

    boolean existsBySourceIdAndTargetIdAndRelationType(Long sourceId, Long targetId, String relationType);
}
