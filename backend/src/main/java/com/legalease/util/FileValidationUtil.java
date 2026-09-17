package com.legalease.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;

@Component
public class FileValidationUtil {

    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF
    private static final byte[] ZIP_DOCX_MAGIC = new byte[]{0x50, 0x4B, 0x03, 0x04}; // PK..
    private static final byte[] ZIP_EMPTY_MAGIC = new byte[]{0x50, 0x4B, 0x05, 0x06}; // PK..
    private static final byte[] JPEG_MAGIC = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47};

    public enum DetectedFileType {
        PDF,
        DOCX,
        IMAGE,
        UNKNOWN
    }

    public DetectedFileType validateMagicBytes(byte[] headerBytes, String filename, String contentType) {
        if (headerBytes == null || headerBytes.length < 4) {
            return DetectedFileType.UNKNOWN;
        }

        // Check PDF
        if (headerBytes[0] == PDF_MAGIC[0] &&
            headerBytes[1] == PDF_MAGIC[1] &&
            headerBytes[2] == PDF_MAGIC[2] &&
            headerBytes[3] == PDF_MAGIC[3]) {
            if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                return DetectedFileType.PDF;
            }
        }

        // Check DOCX (ZIP archive)
        if ((headerBytes[0] == ZIP_DOCX_MAGIC[0] &&
             headerBytes[1] == ZIP_DOCX_MAGIC[1] &&
             headerBytes[2] == ZIP_DOCX_MAGIC[2] &&
             headerBytes[3] == ZIP_DOCX_MAGIC[3]) ||
            (headerBytes[0] == ZIP_EMPTY_MAGIC[0] &&
             headerBytes[1] == ZIP_EMPTY_MAGIC[1] &&
             headerBytes[2] == ZIP_EMPTY_MAGIC[2] &&
             headerBytes[3] == ZIP_EMPTY_MAGIC[3])) {
            if (filename != null && filename.toLowerCase().endsWith(".docx")) {
                return DetectedFileType.DOCX;
            }
        }

        // Check Image (PNG / JPEG)
        if ((headerBytes[0] == PNG_MAGIC[0] &&
             headerBytes[1] == PNG_MAGIC[1] &&
             headerBytes[2] == PNG_MAGIC[2] &&
             headerBytes[3] == PNG_MAGIC[3]) ||
            (headerBytes[0] == JPEG_MAGIC[0] &&
             headerBytes[1] == JPEG_MAGIC[1] &&
             headerBytes[2] == JPEG_MAGIC[2])) {
            return DetectedFileType.IMAGE;
        }

        return DetectedFileType.UNKNOWN;
    }

    public byte[] extractHeader(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int read = is.read(header);
            if (read <= 0) return new byte[0];
            return Arrays.copyOf(header, read);
        } catch (Exception e) {
            return new byte[0];
        }
    }
}
