import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak;
  private initialized = false;
  private initPromise: Promise<boolean> | null = null;
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'gdje-izlazimo',
      clientId: 'gdje-izlazimo'
    });
  }

  async init(): Promise<boolean> {
    if (!this.isBrowser) {
      return true;
    }

    if (this.initialized) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const authenticated = await this.keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256'
        });

        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Keycloak initialization failed', error);
        this.initialized = false;
        return false;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  login(): void {
    if (!this.isBrowser || !this.initialized || this.isAuthenticated()) {
      return;
    }
    
    this.keycloak.login();
  }

  async logout(): Promise<void> {
    const ok = await this.init();
    if (!ok) return;

    await this.keycloak.logout({
      redirectUri: window.location.origin
    });
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