package com.gdje_izlazimo.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GdjeIzlazimoApplication {

    public static void main(String[] args) {
        SpringApplication.run(GdjeIzlazimoApplication.class, args);
    }
}