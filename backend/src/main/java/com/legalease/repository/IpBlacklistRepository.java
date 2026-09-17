package com.legalease.repository;

import com.legalease.entity.IpBlacklist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IpBlacklistRepository extends JpaRepository<IpBlacklist, Long> {

    Optional<IpBlacklist> findByIpAddress(String ipAddress);

    boolean existsByIpAddress(String ipAddress);

    @Query("SELECT b FROM IpBlacklist b WHERE b.ipAddress = :ip AND (b.isPermanent = true OR b.blockedUntil > :now)")
    Optional<IpBlacklist> findActiveBlock(@Param("ip") String ip, @Param("now") LocalDateTime now);

    Page<IpBlacklist> findAllByOrderByBlockedAtDesc(Pageable pageable);
}
