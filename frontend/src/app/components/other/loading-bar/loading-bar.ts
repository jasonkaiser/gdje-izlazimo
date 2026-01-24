import { Component } from '@angular/core';
import { LoadingService } from '../../../core/http/loading-service';
@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [],
  template: `
    @if (loading.isLoading()) {
      <div class="fixed top-0 left-0 right-0 z-9999 h-1 overflow-hidden bg-white/10">
        <div class="h-full w-1/2 bg-white/70 animate-pulse"></div>
      </div>
    }
  `,
})
export class LoadingBar {
  constructor(public loading: LoadingService) {}
}
