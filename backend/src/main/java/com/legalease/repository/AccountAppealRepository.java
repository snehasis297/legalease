package com.legalease.repository;

import com.legalease.entity.AccountAppeal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountAppealRepository extends JpaRepository<AccountAppeal, Long> {

    Optional<AccountAppeal> findByAppealToken(String appealToken);

    Optional<AccountAppeal> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    Page<AccountAppeal> findByStatusOrderByCreatedAtDesc(AccountAppeal.AppealStatus status, Pageable pageable);

    Page<AccountAppeal> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(AccountAppeal.AppealStatus status);
}
