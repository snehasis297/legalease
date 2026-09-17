package com.legalease.repository;

import com.legalease.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByGovernmentIdHash(String governmentIdHash);

    Optional<User> findByGovernmentIdHash(String governmentIdHash);

    Page<User> findByRole(User.Role role, Pageable pageable);

    Page<User> findByAccountStatus(User.AccountStatus accountStatus, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLoginIp = :ip AND u.createdAt >= :since")
    long countByIpAndCreatedAtAfter(@Param("ip") String ip, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.accountStatus = :status")
    long countByAccountStatus(@Param("status") User.AccountStatus status);
}
