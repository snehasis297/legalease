package com.legalease.repository;

import com.legalease.entity.DocumentAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentAnalysisRepository extends JpaRepository<DocumentAnalysis, Long> {

    Optional<DocumentAnalysis> findByDocumentId(Long documentId);

    boolean existsByDocumentId(Long documentId);
}
