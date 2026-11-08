package com.legalease.config;

import com.legalease.entity.LawyerProfile;
import com.legalease.entity.User;
import com.legalease.repository.LawyerProfileRepository;
import com.legalease.repository.UserRepository;
import com.legalease.util.AesEncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.legalease.repository.IpBlacklistRepository ipBlacklistRepository;

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Value("${verification.docs-dir:verification-docs/}")
    private String verifyDocsDir;

    @Value("${appeal.docs-dir:appeal-docs/}")
    private String appealDocsDir;

    private final javax.sql.DataSource dataSource;

    public DataInitializer(UserRepository userRepository,
                           LawyerProfileRepository lawyerProfileRepository,
                           PasswordEncoder passwordEncoder,
                           com.legalease.repository.IpBlacklistRepository ipBlacklistRepository,
                           javax.sql.DataSource dataSource) {
        this.userRepository = userRepository;
        this.lawyerProfileRepository = lawyerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.ipBlacklistRepository = ipBlacklistRepository;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        // Ensure storage directories exist
        createDirectory(uploadDir);
        createDirectory(verifyDocsDir);
        createDirectory(appealDocsDir);

        // Ensure database accepts AADHAAR for government_id_type
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            try {
                stmt.execute("ALTER TABLE users ALTER COLUMN government_id_type VARCHAR(50)");
            } catch (Exception ignored) {}
            try {
                java.sql.ResultSet rs = stmt.executeQuery(
                    "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME='USERS' AND CONSTRAINT_TYPE='CHECK'"
                );
                java.util.List<String> toDrop = new java.util.ArrayList<>();
                while (rs.next()) {
                    toDrop.add(rs.getString(1));
                }
                for (String cName : toDrop) {
                    try {
                        stmt.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS " + cName);
                    } catch (Exception ignored) {}
                }
            } catch (Exception ignored) {}
        } catch (Exception e) {
            log.warn("Database constraint update note: {}", e.getMessage());
        }

        // Ensure localhost is never blocked
        try {
            ipBlacklistRepository.deleteByIpAddress("127.0.0.1");
            ipBlacklistRepository.deleteByIpAddress("0:0:0:0:0:0:0:1");
            ipBlacklistRepository.deleteByIpAddress("localhost");
        } catch (Exception ignored) {
        }

        // 1. Seed Default System Admin (legalease.systemsupport@gmail.com)
        String systemAdminEmail = "legalease.systemsupport@gmail.com";
        if (!userRepository.existsByEmail(systemAdminEmail)) {
            User admin = new User();
            admin.setFullName("LegalEase System Administrator");
            admin.setEmail(systemAdminEmail);
            admin.setPasswordHash(passwordEncoder.encode("Admin@123456"));
            admin.setPhoneNumber("9999999999");
            admin.setRole(User.Role.ADMIN);
            admin.setAccountStatus(User.AccountStatus.ACTIVE);
            admin.setIsEmailVerified(true);
            admin.setIsPhoneVerified(true);
            admin.setIsIdVerified(true);
            admin.setGovernmentIdType(User.GovernmentIdType.PAN);
            admin.setGovernmentIdHash(AesEncryptionUtil.sha256Hex("ADMIN9999A"));
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            log.info("System Admin account seeded: {} / Admin@123456", systemAdminEmail);
        }

        if (!userRepository.existsByEmail("admin@legalease.com")) {
            User admin = new User();
            admin.setFullName("LegalEase Administrator");
            admin.setEmail("admin@legalease.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123456"));
            admin.setPhoneNumber("9999999999");
            admin.setRole(User.Role.ADMIN);
            admin.setAccountStatus(User.AccountStatus.ACTIVE);
            admin.setIsEmailVerified(true);
            admin.setIsPhoneVerified(true);
            admin.setIsIdVerified(true);
            admin.setGovernmentIdType(User.GovernmentIdType.PAN);
            admin.setGovernmentIdHash(AesEncryptionUtil.sha256Hex("ADMIN9999A"));
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            log.info("Default Admin account seeded: admin@legalease.com / Admin@123456");
        }

        // 2. Seed Sample Verified Lawyer for immediate testing
        if (!userRepository.existsByEmail("lawyer@legalease.com")) {
            User lawyer = new User();
            lawyer.setFullName("Advocate Sarah Jenkins");
            lawyer.setEmail("lawyer@legalease.com");
            lawyer.setPasswordHash(passwordEncoder.encode("Lawyer@123456"));
            lawyer.setPhoneNumber("9876543210");
            lawyer.setRole(User.Role.LAWYER);
            lawyer.setAccountStatus(User.AccountStatus.ACTIVE);
            lawyer.setIsEmailVerified(true);
            lawyer.setIsPhoneVerified(true);
            lawyer.setIsIdVerified(true);
            lawyer.setGovernmentIdType(User.GovernmentIdType.PAN);
            lawyer.setGovernmentIdHash(AesEncryptionUtil.sha256Hex("LAWYE1234B"));
            lawyer.setCreatedAt(LocalDateTime.now());
            User savedLawyer = userRepository.save(lawyer);

            LawyerProfile profile = new LawyerProfile(savedLawyer);
            profile.setBarCouncilId("BAR/MH/2015/8842");
            profile.setBarCouncilIdHash(AesEncryptionUtil.sha256Hex("BAR/MH/2015/8842"));
            profile.setBarCouncilState("Maharashtra");
            profile.setYearsOfExperience(9);
            profile.setSpecialization("Corporate & Commercial Contracts");
            profile.setVerificationStatus(LawyerProfile.VerificationStatus.APPROVED);
            profile.setVerifiedAt(LocalDateTime.now());
            lawyerProfileRepository.save(profile);
            log.info("Sample Lawyer account seeded: lawyer@legalease.com / Lawyer@123456");
        }

        // 3. Seed Sample Active Client for immediate testing
        if (!userRepository.existsByEmail("client@legalease.com")) {
            User client = new User();
            client.setFullName("David Miller");
            client.setEmail("client@legalease.com");
            client.setPasswordHash(passwordEncoder.encode("Client@123456"));
            client.setPhoneNumber("9123456789");
            client.setRole(User.Role.CLIENT);
            client.setAccountStatus(User.AccountStatus.ACTIVE);
            client.setIsEmailVerified(true);
            client.setIsPhoneVerified(true);
            client.setIsIdVerified(true);
            client.setDateOfBirth("1992-05-14");
            client.setGender(User.Gender.MALE);
            client.setAddress("42 Silicon Valley Ave");
            client.setCity("San Francisco");
            client.setState("California");
            client.setPincode("94107");
            client.setGovernmentIdType(User.GovernmentIdType.PASSPORT);
            client.setGovernmentIdHash(AesEncryptionUtil.sha256Hex("P1234567"));
            client.setCreatedAt(LocalDateTime.now());
            userRepository.save(client);
            log.info("Sample Client account seeded: client@legalease.com / Client@123456");
        }

        // 4. Seed Sample Pending Lawyer for Verification Queue testing
        if (!userRepository.existsByEmail("pendinglawyer@legalease.com")) {
            User pLawyer = new User();
            pLawyer.setFullName("Advocate Rajesh Sharma");
            pLawyer.setEmail("pendinglawyer@legalease.com");
            pLawyer.setPasswordHash(passwordEncoder.encode("Lawyer@123456"));
            pLawyer.setPhoneNumber("9811223344");
            pLawyer.setRole(User.Role.LAWYER);
            pLawyer.setAccountStatus(User.AccountStatus.PENDING_VERIFICATION);
            pLawyer.setIsEmailVerified(true);
            pLawyer.setIsPhoneVerified(true);
            pLawyer.setIsIdVerified(true);
            pLawyer.setGovernmentIdType(User.GovernmentIdType.PAN);
            pLawyer.setGovernmentIdHash(AesEncryptionUtil.sha256Hex("RAJSH1234K"));
            pLawyer.setCreatedAt(LocalDateTime.now().minusDays(1));
            User savedPLawyer = userRepository.save(pLawyer);

            LawyerProfile pProfile = new LawyerProfile(savedPLawyer);
            pProfile.setBarCouncilId("BAR/DL/2019/5512");
            pProfile.setBarCouncilIdHash(AesEncryptionUtil.sha256Hex("BAR/DL/2019/5512"));
            pProfile.setBarCouncilState("Delhi");
            pProfile.setYearsOfExperience(5);
            pProfile.setSpecialization("Corporate & Commercial Arbitration");
            pProfile.setVerificationStatus(LawyerProfile.VerificationStatus.PENDING);
            lawyerProfileRepository.save(pProfile);
            log.info("Sample Pending Lawyer seeded: pendinglawyer@legalease.com (Queue testing)");
        }

        // 5. Seed Sample IP Blacklist entry if empty
        if (ipBlacklistRepository.count() == 0) {
            com.legalease.entity.IpBlacklist banned = new com.legalease.entity.IpBlacklist();
            banned.setIpAddress("198.51.100.44");
            banned.setReason("Automated Brute-Force Probing Attempt");
            banned.setIsPermanent(false);
            banned.setBlockedUntil(LocalDateTime.now().plusDays(7));
            banned.setBlockedAt(LocalDateTime.now().minusHours(2));
            ipBlacklistRepository.save(banned);
        }
    }

    private void createDirectory(String path) {
        File dir = new File(path);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (created) {
                log.info("Created directory: {}", dir.getAbsolutePath());
            }
        }
    }
}
