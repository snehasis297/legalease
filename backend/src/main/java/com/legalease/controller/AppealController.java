package com.legalease.controller;

import com.legalease.dto.response.ApiResponse;
import com.legalease.entity.AccountAppeal;
import com.legalease.service.AccountSafetyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/appeal")
public class AppealController {

    private final AccountSafetyService accountSafetyService;

    public AppealController(AccountSafetyService accountSafetyService) {
        this.accountSafetyService = accountSafetyService;
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateToken(@RequestParam("token") String token) {
        AccountAppeal appeal = accountSafetyService.validateAppealToken(token);

        String email = appeal.getUser().getEmail();
        String maskedEmail = email.replaceAll("(^[^@]{2})[^@]+(@.*$)", "$1****$2");

        Map<String, Object> data = new HashMap<>();
        data.put("valid", true);
        data.put("maskedEmail", maskedEmail);
        data.put("disableReason", appeal.getUser().getDisableReason());
        data.put("appealType", appeal.getAppealType().name());
        data.put("expiresAt", appeal.getTokenExpiresAt());

        return ResponseEntity.ok(ApiResponse.ok("Appeal token is valid.", data));
    }

    @PostMapping(value = "/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Void>> submitAppeal(@RequestParam("token") String token,
                                                          @RequestParam("reason") String reason,
                                                          @RequestParam(value = "idImage", required = false) MultipartFile idImage,
                                                          @RequestParam(value = "selfieImage", required = false) MultipartFile selfieImage) {
        accountSafetyService.submitAppeal(token, reason, idImage, selfieImage);
        return ResponseEntity.ok(ApiResponse.ok("Appeal submitted successfully. Review will be conducted within 24-48 hours."));
    }
}
