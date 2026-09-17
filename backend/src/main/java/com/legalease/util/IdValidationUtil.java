package com.legalease.util;

import com.legalease.entity.User;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class IdValidationUtil {

    private static final Pattern PAN_PATTERN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]{1}$");
    private static final Pattern VOTER_ID_PATTERN = Pattern.compile("^[A-Z]{3}[0-9]{7}$");
    private static final Pattern PASSPORT_PATTERN = Pattern.compile("^[A-Z][0-9]{7}$");
    private static final Pattern DRIVING_LICENSE_PATTERN = Pattern.compile("^[A-Z]{2}[0-9]{2}[0-9]{11}$");

    public boolean validateId(User.GovernmentIdType type, String idNumber) {
        if (type == null || idNumber == null) {
            return false;
        }
        String cleanId = idNumber.trim().toUpperCase();
        switch (type) {
            case PAN:
                return PAN_PATTERN.matcher(cleanId).matches();
            case VOTER_ID:
                return VOTER_ID_PATTERN.matcher(cleanId).matches();
            case PASSPORT:
                return PASSPORT_PATTERN.matcher(cleanId).matches();
            case DRIVING_LICENSE:
                return DRIVING_LICENSE_PATTERN.matcher(cleanId).matches();
            default:
                return false;
        }
    }

    public static String maskPhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "****";
        }
        String clean = phone.trim();
        if (clean.length() <= 4) {
            return "****" + clean;
        }
        return "****" + clean.substring(clean.length() - 4);
    }
}
