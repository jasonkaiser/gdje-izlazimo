FROM quay.io/keycloak/keycloak:26.6.1

COPY ./keycloak-themes /opt/keycloak/themes

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD [
  "start",
  "--http-enabled=true",
  "--spi-theme-cache-themes=false",
  "--spi-theme-cache-templates=false"
]