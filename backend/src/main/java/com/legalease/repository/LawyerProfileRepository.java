package com.legalease.repository;

import com.legalease.entity.LawyerProfile;
import com.legalease.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, Long> {

    Optional<LawyerProfile> findByUser(User user);

    Optional<LawyerProfile> findByUserId(Long userId);

    boolean existsByBarCouncilIdHash(String barCouncilIdHash);

    Page<LawyerProfile> findByVerificationStatus(LawyerProfile.VerificationStatus status, Pageable pageable);

    long countByVerificationStatus(LawyerProfile.VerificationStatus status);
}
