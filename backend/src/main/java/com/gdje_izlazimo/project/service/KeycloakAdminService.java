package com.gdje_izlazimo.project.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class KeycloakAdminService {

    private final String realm;
    private final Keycloak keycloak;
    private static final Logger log = LoggerFactory.getLogger(KeycloakAdminService.class);

    public KeycloakAdminService(
            @Value("${keycloak.server-url}") String serverUrl,
            @Value("${keycloak.realm}") String realm,
            @Value("${keycloak.admin-client-id}") String clientId,
            @Value("${keycloak.admin-client-secret}") String clientSecret
    ){
        this.realm = realm;
        this.keycloak = KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType("client_credentials")
                .build();

    }

    public void updateUserRole(UUID keycloakUserId, String oldRole, String newRole) {
        var realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(keycloakUserId.toString());

        if (oldRole != null) {
            RoleRepresentation oldRoleRep = realmResource.roles().get(oldRole).toRepresentation();
            userResource.roles().realmLevel().remove(Collections.singletonList(oldRoleRep));
        }

        RoleRepresentation newRoleRep = realmResource.roles().get(newRole).toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(newRoleRep));

        userResource.logout();
    }

    public void updateUserAttribute(UUID keycloakUserId, String attributeName, String value) {
        UserResource userResource = keycloak.realm(realm).users().get(keycloakUserId.toString());

        UserRepresentation user = userResource.toRepresentation();

        Map<String, List<String>> attributes = user.getAttributes();
        if (attributes == null) attributes = new HashMap<>();

        if (value != null && !value.isBlank()) {
            attributes.put(attributeName, List.of(value.trim()));
        } else {
            attributes.remove(attributeName);
        }

        user.setAttributes(attributes);
        userResource.update(user);
    }
}