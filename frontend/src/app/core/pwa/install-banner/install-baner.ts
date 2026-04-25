import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallPromptService } from '../install-prompt.service';

@Component({
  selector: 'app-install-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (promptService.canInstall()) {
      <div class="install-banner">
        <div class="install-banner__content">
          <img src="icons/icon-72x72.png" alt="Gdje Izlazimo" class="install-banner__icon">
          <div class="install-banner__text">
            <strong>Instaliraj aplikaciju</strong>
            <span>Brži pristup, radi i offline</span>
          </div>
        </div>
        <div class="install-banner__actions">
          <button class="install-banner__dismiss" (click)="dismiss()" aria-label="Zatvori">✕</button>
          <button class="install-banner__install" (click)="install()">Instaliraj</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .install-banner {
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      background: var(--surface, #1a1a1a);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .install-banner__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    .install-banner__icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
    }
    .install-banner__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.875rem;
    }
    .install-banner__text strong {
      font-weight: 600;
      color: white;
    }
    .install-banner__text span {
      color: rgba(255,255,255,0.6);
      font-size: 0.75rem;
    }
    .install-banner__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .install-banner__dismiss {
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      padding: 4px 8px;
      font-size: 1rem;
    }
    .install-banner__install {
      background: white;
      color: #0f0f0f;
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
  `]
})
export class InstallBannerComponent implements OnInit {
  readonly promptService = inject(InstallPromptService);
  private dismissed = false;

  ngOnInit() {
    this.promptService.init();
  }

  async install() {
    await this.promptService.promptInstall();
  }

  dismiss() {
    this.dismissed = true;
    this.promptService.canInstall.set(false);
  }
}