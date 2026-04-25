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
          <button class="install-banner__dismiss" (click)="dismissAndroid()">✕</button>
          <button class="install-banner__install" (click)="install()">Instaliraj</button>
        </div>
      </div>
    }
    @if (showIosBanner()) {
      <div class="install-banner ios-banner">
        <div class="install-banner__content">
          <img src="android-chrome-512x512.png" alt="Gdje Izlazimo" class="install-banner__icon">
          <div class="install-banner__text">
            <strong>Dodaj na početni ekran</strong>
            <span>
              Tapni
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin:0 2px">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              dole, pa <b>"Dodaj na početni ekran"</b>
            </span>
          </div>
        </div>
        <button class="install-banner__dismiss" (click)="dismissIos()">✕</button>
        <div class="ios-arrow"></div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
      pointer-events: none;
    }

    .install-banner {
      position: fixed;
      bottom: 7rem;
      left: 1rem;
      right: 1rem;
      background: #1c1c1e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 0.875rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      z-index: 999999;
      pointer-events: all;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      isolation: isolate;
    }

    .ios-arrow {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 8px;
      background: #1c1c1e;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      pointer-events: none;
    }

    .ios-banner {
      bottom: 5rem;
    }

    @keyframes slideUp {
      from { transform: translateY(130%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .install-banner__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
      pointer-events: none;
    }

    .install-banner__icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .install-banner__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .install-banner__text strong {
      font-weight: 600;
      color: #ffffff;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .install-banner__text span {
      color: rgba(255,255,255,0.5);
      font-size: 0.72rem;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .install-banner__actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }

    .install-banner__dismiss {
      all: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: rgba(255,255,255,0.35);
      font-size: 1rem;
      cursor: pointer;
      border-radius: 50%;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      pointer-events: all;
      transition: color 0.15s, background 0.15s;
    }

    .install-banner__dismiss:hover,
    .install-banner__dismiss:active {
      color: rgba(255,255,255,0.7);
      background: rgba(255,255,255,0.08);
    }

    .install-banner__install {
      all: unset;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: #7c3aed;
      color: #ffffff;
      border-radius: 10px;
      padding: 0 1rem;
      height: 36px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      pointer-events: all;
      transition: opacity 0.15s, transform 0.1s;
      box-sizing: border-box;
    }

    .install-banner__install:hover {
      opacity: 0.9;
    }

    .install-banner__install:active {
      transform: scale(0.96);
      opacity: 0.85;
    }

    .install-banner__share {
      background: #007AFF;
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

    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;

    if (isStandalone) return;

    if (isIos) {
      if (!sessionStorage.getItem('ios-banner-dismissed')) {
        setTimeout(() => this.showIosBanner.set(true), 2500);
      }

    } else if (isAndroid) {
      if (!sessionStorage.getItem('android-banner-dismissed')) {
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 500;
          if (this.promptService.canInstall()) {
            this.showAndroidBanner.set(true);
            clearInterval(interval);
          } else if (elapsed >= 10000) {
            clearInterval(interval);
          }
        }, 500);
      }
    }
  }

  async install() {
    const result = await this.promptService.promptInstall();
    if (result === 'accepted') {
      this.showAndroidBanner.set(false);
    }
  }

  async shareIos() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'Gdje Izlazimo',
        text: 'Otkrij mjesta i događaje u tvojom gradu.',
        url: window.location.origin
      });
    } catch {
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