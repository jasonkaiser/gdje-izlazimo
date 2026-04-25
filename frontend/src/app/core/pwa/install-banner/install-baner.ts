import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InstallPromptService } from '../install-prompt.service';

@Component({
  selector: 'app-install-banner',
  standalone: true,
  template: `
    @if (showAndroidBanner()) {
      <div class="install-banner">
        <div class="install-banner__content">
          <img src="android-chrome-512x512.png" alt="Gdje Izlazimo" class="install-banner__icon">
          <div class="install-banner__text">
            <strong>Instaliraj aplikaciju</strong>
            <span>Brži pristup, radi i offline</span>
          </div>
        </div>
        <div class="install-banner__actions">
          <button class="install-banner__dismiss" (click)="dismissAndroid()" aria-label="Zatvori">✕</button>
          <button class="install-banner__install" (click)="install()">Instaliraj</button>
        </div>
      </div>
    }

    @if (showIosBanner()) {
      <div class="install-banner ios-banner">
        <div class="install-banner__content">
          <img src="android-chrome-512x512.png" alt="Gdje Izlazimo" class="install-banner__icon">
          <div class="install-banner__text">
            <strong>Instaliraj aplikaciju</strong>
            <span>
              Tapni
              <span class="ios-share-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </span>
              pa <b>"Dodaj na početni ekran"</b>
            </span>
          </div>
        </div>
        <div class="install-banner__actions">
          <button class="install-banner__dismiss" (click)="dismissIos()" aria-label="Zatvori">✕</button>
        </div>
        <div class="ios-arrow"></div>
      </div>
    }
  `,
  styles: [`
    .install-banner {
      position: fixed;
      bottom: 5.5rem;       
      left: 1rem;
      right: 1rem;
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      z-index: 99999;        
      pointer-events: all;  
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .ios-banner {
       bottom: 5.5rem; 
    }

    .ios-arrow {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 8px;
      background: #1a1a1a;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      border-left: 1px solid rgba(255,255,255,0.12);
      border-right: 1px solid rgba(255,255,255,0.12);
    }

    @keyframes slideUp {
      from { transform: translateY(120%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .install-banner__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }

    .install-banner__icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .install-banner__text {
      display: flex;
      flex-direction: column;
      gap: 3px;
      font-size: 0.875rem;
      min-width: 0;
    }

    .install-banner__text strong {
      font-weight: 600;
      color: #ffffff;
      font-size: 0.9rem;
    }

    .install-banner__text span {
      color: rgba(255,255,255,0.55);
      font-size: 0.75rem;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 3px;
      flex-wrap: wrap;
    }

    .install-banner__text span b {
      color: rgba(255,255,255,0.8);
      font-weight: 500;
    }

    .ios-share-icon {
      display: inline-flex;
      align-items: center;
      color: #007AFF;
      margin: 0 1px;
    }

    .install-banner__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .install-banner__dismiss {
      background: none;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      padding: 4px 8px;
      font-size: 1.1rem;
      line-height: 1;
      transition: color 0.2s;
    }

    .install-banner__dismiss:hover {
      color: rgba(255,255,255,0.7);
    }

    .install-banner__install {
      background: #ffffff;
      color: #0f0f0f;
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s;
    }

    .install-banner__install:hover {
      opacity: 0.9;
    }
  `]
})
export class InstallBannerComponent implements OnInit {
  readonly promptService = inject(InstallPromptService);
  private platformId = inject(PLATFORM_ID);

  readonly showAndroidBanner = signal(false);
  readonly showIosBanner = signal(false);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.promptService.init();

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;

    if (isStandalone) return;

   if (isIos) {
      const dismissed = sessionStorage.getItem('ios-banner-dismissed');
      if (!dismissed) {
        setTimeout(() => this.showIosBanner.set(true), 2000);
      }
    } else if (isAndroid) {
      const dismissed = sessionStorage.getItem('android-banner-dismissed');
      if (!dismissed) {
        setTimeout(() => {
          if (this.promptService.canInstall()) {
            this.showAndroidBanner.set(true);
          }
        }, 2000);
      }
    }
  }

  async install() {
    const result = await this.promptService.promptInstall();
    if (result === 'accepted') {
      this.showAndroidBanner.set(false);
    }
  }

  dismissAndroid() {
    this.showAndroidBanner.set(false);
    sessionStorage.setItem('android-banner-dismissed', '1');
  }

  dismissIos() {
    this.showIosBanner.set(false);
    sessionStorage.setItem('ios-banner-dismissed', '1');
  }
}