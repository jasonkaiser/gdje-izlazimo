import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak;
  private initialized = false;
  private initPromise: Promise<boolean> | null = null;
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  private _authenticated = signal(false);
  authenticated = this._authenticated.asReadonly();

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'gdje-izlazimo',
      clientId: 'gdje-izlazimo'
    });
  }

  private syncAuthState() {
    const isAuth =
      this.initialized && !!this.keycloak.token && !this.keycloak.isTokenExpired();
    this._authenticated.set(isAuth);
  }

  async init(): Promise<boolean> {
    if (!this.isBrowser) return true;
    if (this.initialized) return true;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256'
        });

        this.initialized = true;

        queueMicrotask(() => this.syncAuthState());

        return true;
      } catch (error) {
        console.error('Keycloak initialization failed', error);
        this.initialized = false;
        queueMicrotask(() => this.syncAuthState());
        return false;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  login(): void {
    if (!this.isBrowser || !this.initialized || this.authenticated()) return;
    this.keycloak.login();
  }

  async logout(): Promise<void> {
    const ok = await this.init();
    if (!ok) return;

    await this.keycloak.logout({ redirectUri: window.location.origin });

    queueMicrotask(() => this.syncAuthState());
  }

  async getToken(): Promise<string | undefined> {
    if (!this.initialized) return undefined;
    if (!this.keycloak.authenticated) return undefined;

    try {
      await this.keycloak.updateToken(30);
      queueMicrotask(() => this.syncAuthState());
      return this.keycloak.token ?? undefined;
    } catch (error) {
      console.error('Failed to refresh token', error);
      queueMicrotask(() => this.syncAuthState());
      return this.keycloak.token ?? undefined;
    }
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  getUserId(): string | undefined {
    return this.keycloak.subject;
  }

  getUserProfile() {
    return this.keycloak.tokenParsed;
  }

  getInitializationStatus(): boolean {
    return this.initialized;
  }


  hasRole(role: string): boolean {
    const roles: string[] =
      (this.keycloak.tokenParsed as any)?.realm_access?.roles ?? [];

    const needle = role.toLowerCase();
    return roles.some(r => r.toLowerCase() === needle);
  }


  getRoles(): string[] {
    return (this.keycloak.tokenParsed as any)?.realm_access?.roles ?? [];
  }
}