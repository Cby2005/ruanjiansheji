package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.PestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PestTypeRepository extends JpaRepository<PestType, Long> {
    Optional<PestType> findByPestCode(String pestCode);
    Optional<PestType> findByPestName(String pestName);
    List<PestType> findByPestCategory(String pestCategory);

    @Query("SELECT p.pestName FROM PestType p ORDER BY FUNCTION('RAND')")
    List<String> findRandomPestNames(org.springframework.data.domain.Pageable pageable);
}
