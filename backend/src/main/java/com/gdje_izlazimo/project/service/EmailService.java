package com.gdje_izlazimo.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.from:noreply@gdje-izlazimo.local}") String from)
    {

        this.mailSender = mailSender;
        this.from = from;
    }
    public void sendPlainText(String to, String subject, String body){
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setFrom(from);
        msg.setSubject(subject);
        msg.setText(body);

        mailSender.send(msg);

    }

}
