import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _active = signal(0);

  isLoading = computed(() => this._active() > 0);

  start() {
    this._active.update((n) => n + 1);
  }

  stop() {
    this._active.update((n) => Math.max(0, n - 1));
  }

  reset() {
    this._active.set(0);
  }
}
