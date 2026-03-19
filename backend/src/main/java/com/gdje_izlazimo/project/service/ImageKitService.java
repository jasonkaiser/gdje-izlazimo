package com.gdje_izlazimo.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageKitService {

    @Value("${imagekit.private-key}")
    private String privateKey;

    private static final String UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
    private static final String DELETE_URL  = "https://api.imagekit.io/v1/files/";

    private final RestTemplate restTemplate = new RestTemplate();

    public String[] uploadImage(MultipartFile file, String folder) {
        try {
            String auth = Base64.getEncoder()
                    .encodeToString((privateKey + ":").getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("Authorization", "Basic " + auth);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return UUID.randomUUID() + "_" + file.getOriginalFilename();
                }
            });
            body.add("fileName", UUID.randomUUID() + "_" + file.getOriginalFilename());
            body.add("folder", folder);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(UPLOAD_URL, request, Map.class);

            Map<String, Object> responseBody = response.getBody();

            String url    = (String) responseBody.get("url");
            String fileId = (String) responseBody.get("fileId");

            return new String[]{url, fileId};

        } catch (IOException e) {
            throw new RuntimeException("Image upload to ImageKit failed: " + e.getMessage(), e);
        }
    }

    public void deleteImage(String fileId) {
        String auth = Base64.getEncoder()
                .encodeToString((privateKey + ":").getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + auth);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        restTemplate.exchange(
                DELETE_URL + fileId,
                HttpMethod.DELETE,
                request,
                Void.class
        );
    }
}