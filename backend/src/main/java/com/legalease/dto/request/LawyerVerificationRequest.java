package com.legalease.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LawyerVerificationRequest {

    @NotBlank(message = "Bar council ID is required")
    private String barCouncilId;

    @NotBlank(message = "Bar council state is required")
    private String barCouncilState;

    @NotNull(message = "Years of experience is required")
    private Integer yearsOfExperience;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    public LawyerVerificationRequest() {
    }

    public String getBarCouncilId() {
        return barCouncilId;
    }

    public void setBarCouncilId(String barCouncilId) {
        this.barCouncilId = barCouncilId;
    }

    public String getBarCouncilState() {
        return barCouncilState;
    }

    public void setBarCouncilState(String barCouncilState) {
        this.barCouncilState = barCouncilState;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
}
