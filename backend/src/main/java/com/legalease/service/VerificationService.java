package com.legalease.service;

import com.legalease.entity.AccountAppeal;
import com.legalease.entity.LawyerProfile;
import com.legalease.entity.User;
import com.legalease.entity.VerificationDocument;
import com.legalease.exception.FileProcessingException;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import com.legalease.repository.LawyerProfileRepository;
import com.legalease.repository.UserRepository;
import com.legalease.repository.VerificationDocumentRepository;
import com.legalease.util.AesEncryptionUtil;
import com.legalease.util.FileValidationUtil;
import com.legalease.util.IdValidationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;

@Service
public class VerificationService {

    private static final Logger log = LoggerFactory.getLogger(VerificationService.class);

    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final IdValidationUtil idValidationUtil;
    private final FileValidationUtil fileValidationUtil;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final ThreatDetectionService threatDetectionService;
    private final AccountSafetyService accountSafetyService;

    @Value("${verification.docs-dir:verification-docs/}")
    private String verifyDocsDir;

    public VerificationService(UserRepository userRepository,
                               LawyerProfileRepository lawyerProfileRepository,
                               VerificationDocumentRepository verificationDocumentRepository,
                               IdValidationUtil idValidationUtil,
                               FileValidationUtil fileValidationUtil,
                               AesEncryptionUtil aesEncryptionUtil,
                               ThreatDetectionService threatDetectionService,
                               AccountSafetyService accountSafetyService) {
        this.userRepository = userRepository;
        this.lawyerProfileRepository = lawyerProfileRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.idValidationUtil = idValidationUtil;
        this.fileValidationUtil = fileValidationUtil;
        this.aesEncryptionUtil = aesEncryptionUtil;
        this.threatDetectionService = threatDetectionService;
        this.accountSafetyService = accountSafetyService;
    }

    // Step 3: Government ID KYC Submission
    @Transactional
    public void submitKyc(User user, String dob, String gender, String address, String city,
                          String state, String pincode, User.GovernmentIdType idType,
                          String idNumber, String clientIp) {

        // Check age verification first
        if (accountSafetyService.isUnderage(dob)) {
            accountSafetyService.disableAccount(user, User.AccountStatus.AGE_VERIFICATION_REQUIRED,
                    "Account age indicates user is under 18 years old", AccountAppeal.AppealType.AGE_VERIFICATION);
            throw new UnauthorizedException("You must be 18 years or older to register for LegalEase. Account suspended for age verification.");
        }

        // 1. Validate ID format using regex
        if (!idValidationUtil.validateId(idType, idNumber)) {
            threatDetectionService.recordFakeIdAttempt(user, clientIp,
                    "Invalid " + idType + " format: " + idNumber);
            throw new IllegalArgumentException("Invalid format for " + idType + ". Please check and try again.");
        }

        // 2. Compute SHA-256 hash
        String idHash = AesEncryptionUtil.sha256Hex(idNumber);

        // 3. Check duplicate in DB
        if (userRepository.existsByGovernmentIdHash(idHash)) {
            threatDetectionService.handleDuplicateIdAttempt(user, clientIp, idHash);
            // Will throw DuplicateIdException
        }

        // 4. Encrypt sensitive fields
        String encryptedIdNumber = aesEncryptionUtil.encryptField(idNumber.trim().toUpperCase());

        user.setDateOfBirth(dob);
        try {
            user.setGender(User.Gender.valueOf(gender.toUpperCase()));
        } catch (Exception e) {
            user.setGender(User.Gender.OTHER);
        }
        user.setAddress(address);
        user.setCity(city);
        user.setState(state);
        user.setPincode(pincode);
        user.setGovernmentIdType(idType);
        user.setGovernmentIdNumber(encryptedIdNumber);
        user.setGovernmentIdHash(idHash);
        user.setIsIdVerified(true);

        // If Client -> ACTIVE; If Lawyer -> PENDING_VERIFICATION (needs documents)
        if (user.getRole() == User.Role.CLIENT) {
            user.setAccountStatus(User.AccountStatus.ACTIVE);
        } else if (user.getRole() == User.Role.LAWYER) {
            user.setAccountStatus(User.AccountStatus.PENDING_VERIFICATION);
        }

        userRepository.save(user);
        log.info("KYC successfully verified for user {}. New status: {}", user.getEmail(), user.getAccountStatus());
    }

    // Step 4: Lawyer Document Upload
    @Transactional
    public void uploadLawyerDocuments(User lawyer, String barCouncilId, String barCouncilState,
                                      Integer experienceYears, String specialization,
                                      MultipartFile barCert, MultipartFile degreeCert,
                                      MultipartFile govtIdFront, MultipartFile govtIdBack,
                                      String clientIp) {

        // Validate lawyer profile exists or create
        LawyerProfile profile = lawyerProfileRepository.findByUser(lawyer)
                .orElse(new LawyerProfile(lawyer));

        String barCouncilHash = AesEncryptionUtil.sha256Hex(barCouncilId);
        if (lawyerProfileRepository.existsByBarCouncilIdHash(barCouncilHash)) {
            threatDetectionService.handleDuplicateIdAttempt(lawyer, clientIp, barCouncilHash);
        }

        profile.setBarCouncilId(aesEncryptionUtil.encryptField(barCouncilId));
        profile.setBarCouncilIdHash(barCouncilHash);
        profile.setBarCouncilState(barCouncilState);
        profile.setYearsOfExperience(experienceYears);
        profile.setSpecialization(specialization);
        profile.setVerificationStatus(LawyerProfile.VerificationStatus.PENDING);
        lawyerProfileRepository.save(profile);

        // Upload and encrypt each document
        saveVerificationDoc(lawyer, VerificationDocument.DocumentType.BAR_COUNCIL_CERTIFICATE, barCert, clientIp);
        saveVerificationDoc(lawyer, VerificationDocument.DocumentType.DEGREE_CERTIFICATE, degreeCert, clientIp);
        saveVerificationDoc(lawyer, VerificationDocument.DocumentType.GOVT_ID_FRONT, govtIdFront, clientIp);
        saveVerificationDoc(lawyer, VerificationDocument.DocumentType.GOVT_ID_BACK, govtIdBack, clientIp);

        lawyer.setAccountStatus(User.AccountStatus.PENDING_VERIFICATION);
        userRepository.save(lawyer);

        log.info("Lawyer credentials and 4 encrypted documents submitted for review: {}", lawyer.getEmail());
    }

    private void saveVerificationDoc(User user, VerificationDocument.DocumentType type, MultipartFile file, String clientIp) {
        if (file == null || file.isEmpty()) {
            throw new FileProcessingException("Document file for " + type + " is required");
        }

        // Validate magic bytes
        byte[] header = fileValidationUtil.extractHeader(file);
        FileValidationUtil.DetectedFileType detected =
                fileValidationUtil.validateMagicBytes(header, file.getOriginalFilename(), file.getContentType());

        if (detected == FileValidationUtil.DetectedFileType.UNKNOWN) {
            threatDetectionService.recordMaliciousFile(user, clientIp, file.getOriginalFilename(), "Verification document validation failed");
        }

        try {
            byte[] fileBytes = file.getBytes();
            AesEncryptionUtil.EncryptedData encrypted = aesEncryptionUtil.encryptFileGcm(fileBytes);

            File dir = new File(verifyDocsDir);
            if (!dir.exists()) dir.mkdirs();

            String storedFilename = "verify_" + user.getId() + "_" + type.name() + "_" + System.currentTimeMillis() + ".enc";
            File target = new File(dir, storedFilename);
            try (FileOutputStream fos = new FileOutputStream(target)) {
                fos.write(encrypted.getCipherBytes());
            }

            VerificationDocument doc = new VerificationDocument(user, type, storedFilename, encrypted.getBase64Iv());
            verificationDocumentRepository.save(doc);
        } catch (Exception e) {
            throw new FileProcessingException("Failed to store encrypted verification document: " + e.getMessage(), e);
        }
    }

    // Step 5: Admin Approves Lawyer
    @Transactional
    public void approveLawyer(Long lawyerUserId, User adminUser) {
        LawyerProfile profile = lawyerProfileRepository.findByUserId(lawyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer profile not found for user id: " + lawyerUserId));

        profile.setVerificationStatus(LawyerProfile.VerificationStatus.APPROVED);
        profile.setVerifiedBy(adminUser);
        profile.setVerifiedAt(LocalDateTime.now());
        lawyerProfileRepository.save(profile);

        User lawyer = profile.getUser();
        lawyer.setAccountStatus(User.AccountStatus.ACTIVE);
        userRepository.save(lawyer);

        log.info("Lawyer {} approved by admin {}", lawyer.getEmail(), adminUser.getEmail());
    }

    // Step 5: Admin Rejects Lawyer
    @Transactional
    public void rejectLawyer(Long lawyerUserId, String reason, User adminUser) {
        LawyerProfile profile = lawyerProfileRepository.findByUserId(lawyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer profile not found for user id: " + lawyerUserId));

        profile.setVerificationStatus(LawyerProfile.VerificationStatus.REJECTED);
        profile.setRejectionReason(reason);
        profile.setVerifiedBy(adminUser);
        profile.setVerifiedAt(LocalDateTime.now());
        lawyerProfileRepository.save(profile);

        log.info("Lawyer {} rejected by admin {}. Reason: {}", profile.getUser().getEmail(), adminUser.getEmail(), reason);
    }
}
