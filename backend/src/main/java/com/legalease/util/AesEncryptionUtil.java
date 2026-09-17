package com.legalease.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class AesEncryptionUtil {

    private final byte[] fileKeyBytes;
    private final byte[] fieldKeyBytes;
    private final SecureRandom secureRandom = new SecureRandom();

    public AesEncryptionUtil(@Value("${encryption.aes-secret}") String fileKey,
                             @Value("${encryption.aes-field-key}") String fieldKey) {
        this.fileKeyBytes = deriveKeyBytes(fileKey);
        this.fieldKeyBytes = deriveKeyBytes(fieldKey);
    }

    private byte[] deriveKeyBytes(String rawKey) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            return sha.digest(rawKey.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to derive AES key bytes", e);
        }
    }

    // --- SHA-256 Hashing ---
    public static String sha256Hex(String input) {
        if (input == null) return null;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.trim().toUpperCase().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 computation failed", e);
        }
    }

    // --- AES-256-GCM for Files ---
    public static class EncryptedData {
        private final byte[] cipherBytes;
        private final String base64Iv;

        public EncryptedData(byte[] cipherBytes, String base64Iv) {
            this.cipherBytes = cipherBytes;
            this.base64Iv = base64Iv;
        }

        public byte[] getCipherBytes() {
            return cipherBytes;
        }

        public String getBase64Iv() {
            return base64Iv;
        }
    }

    public EncryptedData encryptFileGcm(byte[] plaintext) {
        try {
            byte[] iv = new byte[12]; // 96-bit IV recommended for GCM
            secureRandom.nextBytes(iv);
            SecretKey secretKey = new SecretKeySpec(fileKeyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);
            byte[] cipherText = cipher.doFinal(plaintext);
            return new EncryptedData(cipherText, Base64.getEncoder().encodeToString(iv));
        } catch (Exception e) {
            throw new RuntimeException("AES-GCM encryption failed", e);
        }
    }

    public byte[] decryptFileGcm(byte[] cipherBytes, String base64Iv) {
        try {
            byte[] iv = Base64.getDecoder().decode(base64Iv);
            SecretKey secretKey = new SecretKeySpec(fileKeyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
            return cipher.doFinal(cipherBytes);
        } catch (Exception e) {
            throw new RuntimeException("AES-GCM decryption failed", e);
        }
    }

    // --- AES-256-CBC for Sensitive DB Fields ---
    public String encryptField(String plaintext) {
        if (plaintext == null || plaintext.trim().isEmpty()) return plaintext;
        try {
            byte[] iv = new byte[16];
            secureRandom.nextBytes(iv);
            SecretKey secretKey = new SecretKeySpec(fieldKeyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new IvParameterSpec(iv));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Field encryption failed", e);
        }
    }

    public String decryptField(String cipherString) {
        if (cipherString == null || !cipherString.contains(":")) return cipherString;
        try {
            String[] parts = cipherString.split(":", 2);
            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] encrypted = Base64.getDecoder().decode(parts[1]);
            SecretKey secretKey = new SecretKeySpec(fieldKeyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new IvParameterSpec(iv));
            byte[] original = cipher.doFinal(encrypted);
            return new String(original, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Field decryption failed", e);
        }
    }
}
