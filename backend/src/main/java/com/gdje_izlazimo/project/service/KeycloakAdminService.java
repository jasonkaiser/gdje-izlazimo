package com.gdje_izlazimo.project.service;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin-client-id}")
    private String clientId;

    @Value("${keycloak.admin-client-secret}")
    private String clientSecret;

    private Keycloak buildKeycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType("client_credentials")
                .build();
    }

    public void updateUserRole(UUID keycloakUserId, String oldRole, String newRole) {
        Keycloak keycloak = buildKeycloak();
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
}