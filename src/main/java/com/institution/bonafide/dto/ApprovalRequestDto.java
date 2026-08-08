package com.institution.bonafide.dto;

public class ApprovalRequestDto {
    private boolean approved;
    private String remarks;

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
