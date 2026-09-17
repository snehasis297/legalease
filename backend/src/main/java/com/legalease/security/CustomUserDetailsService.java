package com.legalease.security;

import com.legalease.entity.User;
import com.legalease.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        boolean enabled = user.getAccountStatus() == User.AccountStatus.ACTIVE ||
                          user.getAccountStatus() == User.AccountStatus.PENDING_VERIFICATION ||
                          user.getAccountStatus() == User.AccountStatus.PENDING_KYC;
        boolean accountNonLocked = user.getAccountStatus() != User.AccountStatus.LOCKED &&
                                   user.getAccountStatus() != User.AccountStatus.SUSPENDED &&
                                   user.getAccountStatus() != User.AccountStatus.DISABLED &&
                                   user.getAccountStatus() != User.AccountStatus.TEMPORARILY_DISABLED;

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                enabled,
                true, // accountNonExpired
                true, // credentialsNonExpired
                accountNonLocked,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
