package com.laurel.docurel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// The main configuration class, the class that configures the application
@SpringBootApplication
public class DocurelApplication {
	public static void main(String[] args) {
		// Starts the Spring container runtime env
		SpringApplication.run(DocurelApplication.class, args);
	}
}
