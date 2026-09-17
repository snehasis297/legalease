package com.legalease.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:support@legalease.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        String subject = "Your LegalEase Verification Code: " + otp;
        String html = "<div style='font-family: Arial, sans-serif; background-color: #0A0A0F; color: #FFFFFF; padding: 24px; border-radius: 8px;'>"
                + "<h2 style='color: #00D4FF;'>LegalEase Verification Code</h2>"
                + "<p style='color: #A0A0B0;'>You requested a code for <strong>" + purpose + "</strong>.</p>"
                + "<div style='background: #1A1A2E; border: 1px solid #534AB7; padding: 16px; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #00D4FF; margin: 20px 0; border-radius: 8px;'>"
                + otp
                + "</div>"
                + "<p style='color: #A0A0B0;'>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>"
                + "</div>";
        sendHtmlEmail(toEmail, subject, html);
    }

    @Async
    public void sendAccountDisabledEmail(String toEmail, String fullName, String reason, String appealToken) {
        String appealLink = frontendUrl + "/appeal?token=" + appealToken;
        String template = loadTemplate("account-disabled.html");
        String content = template
                .replace("[[${fullName}]]", fullName)
                .replace("[[${disableReason}]]", reason != null ? reason : "Suspicious activity detected")
                .replace("[[${appealLink}]]", appealLink);

        sendHtmlEmail(toEmail, "Your LegalEase account has been paused", content);
    }

    @Async
    public void sendAgeVerificationEmail(String toEmail, String fullName, String appealToken) {
        String appealLink = frontendUrl + "/appeal?token=" + appealToken;
        String template = loadTemplate("age-verification.html");
        String content = template
                .replace("[[${fullName}]]", fullName)
                .replace("[[${appealLink}]]", appealLink);

        sendHtmlEmail(toEmail, "Age verification required for your LegalEase account", content);
    }

    @Async
    public void sendAppealApprovedEmail(String toEmail, String fullName) {
        String loginUrl = frontendUrl + "/login";
        String template = loadTemplate("appeal-approved.html");
        String content = template
                .replace("[[${fullName}]]", fullName)
                .replace("[[${loginUrl}]]", loginUrl);

        sendHtmlEmail(toEmail, "Your LegalEase account has been restored \u2713", content);
    }

    @Async
    public void sendAppealRejectedEmail(String toEmail, String fullName, String rejectionReason) {
        String template = loadTemplate("appeal-rejected.html");
        String content = template
                .replace("[[${fullName}]]", fullName)
                .replace("[[${rejectionReason}]]", rejectionReason != null ? rejectionReason : "Documents did not match requirements");

        sendHtmlEmail(toEmail, "We could not verify your LegalEase account", content);
    }

    @Async
    public void sendNewDeviceAlert(String toEmail, String fullName, String ip, String userAgent) {
        String subject = "New Sign-in Alert for your LegalEase account";
        String html = "<div style='font-family: Arial, sans-serif; background-color: #0A0A0F; color: #FFFFFF; padding: 24px; border-radius: 8px;'>"
                + "<h2 style='color: #00D4FF;'>New Device Sign-in Detected</h2>"
                + "<p style='color: #A0A0B0;'>Hello " + fullName + ",</p>"
                + "<p style='color: #A0A0B0;'>A new login was recorded with the following details:</p>"
                + "<p style='color: #FFFFFF;'><strong>IP Address:</strong> " + ip + "<br/><strong>Device / Browser:</strong> " + userAgent + "</p>"
                + "<p style='color: #A0A0B0;'>If this was you, no action is needed. If you did not log in, please reset your password immediately.</p>"
                + "</div>";
        sendHtmlEmail(toEmail, subject, html);
    }

    @Async
    public void sendAnalysisCompletedEmail(String toEmail, String filename, int riskScore, String riskLevel) {
        String subject = "Document Analysis Complete: " + filename;
        String html = "<div style='font-family: Arial, sans-serif; background-color: #0A0A0F; color: #FFFFFF; padding: 24px; border-radius: 8px;'>"
                + "<h2 style='color: #00D4FF;'>Analysis Ready</h2>"
                + "<p style='color: #A0A0B0;'>Your document <strong>" + filename + "</strong> has been fully analyzed by LegalEase AI.</p>"
                + "<p style='color: #FFFFFF;'><strong>Risk Score:</strong> " + riskScore + "/100 (" + riskLevel + " RISK)</p>"
                + "<p><a href='" + frontendUrl + "/client/documents' style='background: #534AB7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;'>View Analysis &amp; Chat</a></p>"
                + "</div>";
        sendHtmlEmail(toEmail, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Sent email '{}' to {}", subject, to);
        } catch (Exception e) {
            log.warn("Failed to send real email via SMTP to {}: {}. Printing email content to logs for development.", to, e.getMessage());
            log.info("\n--- DEV EMAIL DISPATCH ---\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n-------------------------", to, subject, htmlContent);
        }
    }

    private String loadTemplate(String templateName) {
        try (InputStream is = getClass().getResourceAsStream("/templates/email/" + templateName)) {
            if (is == null) {
                return "<p>[[${fullName}]], please check your account status.</p>";
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to load email template: " + templateName, e);
            return "<p>[[${fullName}]], please check your account status.</p>";
        }
    }
}
