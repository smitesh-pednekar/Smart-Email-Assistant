package com.email.assistant.app;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
    private String language; // New field for reply language
    private String customInstructions; // New field for voice-input instructions
}