import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak;
  private initialized = false;

  constructor() {
    console.log('AuthService constructor called');
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'gdje-izlazimo',
      clientId: 'gdje-izlazimo'
    });
  }

  async init(): Promise<boolean> {
    console.log('AuthService init() called');
    
    if (this.initialized) {
      console.log('Already initialized');
      return true;
    }

    try {
      // keycloak.init() returns true if user is authenticated, false if not
      // But in both cases, the initialization is successful
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      });
      
      // Mark as initialized regardless of authentication status
      this.initialized = true;
      
      console.log('Keycloak initialized successfully');
      console.log('User authenticated:', authenticated);
      console.log('Token present:', !!this.keycloak.token);
      
      return true;
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      this.initialized = false;
      return false;
    }
  }

  login(): void {
    console.log('Login called, initialized:', this.initialized);
    if (!this.initialized) {
      console.error('Keycloak not initialized');
      return;
    }
    this.keycloak.login();
  }

  logout(): void {
    console.log('Logout called, initialized:', this.initialized);
    if (!this.initialized) {
      console.error('Keycloak not initialized');
      return;
    }
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  async getToken(): Promise<string | undefined> {
    if (!this.initialized) return undefined;
    
    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token;
    } catch (error) {
      console.error('Failed to refresh token', error);
      return undefined;
    }
  }

  getUserId(): string | undefined {
    return this.keycloak.subject;
  }

  isAuthenticated(): boolean {
    return this.initialized && !!this.keycloak.token && !this.keycloak.isTokenExpired();
  }

  getUserProfile() {
    return this.keycloak.tokenParsed;
  }

  getInitializationStatus(): boolean {
    return this.initialized;
  }
}