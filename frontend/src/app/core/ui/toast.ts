import { Injectable, signal } from '@angular/core';

export type Variant = 'success' | 'error' | 'warning';

export interface ToastState{
  open: boolean;
  variant: Variant;
  message: string;

}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _state = signal<ToastState>({
    open: false,
    variant: 'success',
    message: ''
  });

  
  state = this._state.asReadonly();
  private timer?: number;


  show(message: string, variant: Variant = 'error', autoHideMs = 3000) {
    queueMicrotask(() => {
      this._state.set({ open: true, variant, message });

      if (this.timer) window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.hide(), autoHideMs);
    });
  }


  hide() {
    this._state. update((s) => ({ ...s, open: false }))
  }

}
