import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Variant = 'success' | 'error' | 'warning';

export interface ToastState {
  open: boolean;
  variant: Variant;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private platformId = inject(PLATFORM_ID);
  
  private _state = signal<ToastState>({
    open: false,
    variant: 'success',
    message: ''
  });

  state = this._state.asReadonly();
  private timer?: number;

  show(message: string, variant: Variant = 'error', autoHideMs = 3000) {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[Toast] SSR - skipping:', message);
      return;
    }

    queueMicrotask(() => {
      this._state.set({ open: true, variant, message });

      if (this.timer) window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.hide(), autoHideMs);
    });
  }

  hide() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this._state.update((s) => ({ ...s, open: false }));
  }
}