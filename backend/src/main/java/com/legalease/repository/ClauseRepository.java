package com.legalease.repository;

import com.legalease.entity.Clause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClauseRepository extends JpaRepository<Clause, Long> {

    List<Clause> findByDocumentIdOrderByClauseNumberAsc(Long documentId);

    long countByDocumentId(Long documentId);

    long countByDocumentIdAndRiskLevel(Long documentId, Clause.RiskLevel riskLevel);

    void deleteByDocumentId(Long documentId);
}
