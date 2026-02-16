import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings';
import { ToastService } from '../../../../core/ui/toast';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css'
})
export class AdminSettingsComponent {
  
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);

  settings = this.settingsService.settings;

  maxAdvanceBookingDays = computed(() => this.settings().maxAdvanceBookingDays);
  minAdvanceNoticeHours = computed(() => this.settings().minAdvanceNoticeHours);
  defaultDurationHours = computed(() => this.settings().defaultDurationHours);

  toggleMaintenanceMode(): void {
    this.settingsService.toggleMaintenanceMode();
    const isEnabled = this.settings().maintenanceMode;
    this.toastService.show(
      `Mod održavanja ${isEnabled ? 'uključen' : 'isključen'}`,
      isEnabled ? 'warning' : 'success'
    );
  }

  toggleNewRegistrations(): void {
    this.settingsService.toggleNewRegistrations();
    const isEnabled = this.settings().allowNewRegistrations;
    this.toastService.show(
      `Nove registracije ${isEnabled ? 'dozvoljene' : 'onemogućene'}`,
      'success'
    );
  }

  toggleEmailNotifications(): void {
    this.settingsService.toggleEmailNotifications();
  }

  toggleSmsNotifications(): void {
    this.settingsService.toggleSmsNotifications();
  }

  togglePushNotifications(): void {
    this.settingsService.togglePushNotifications();
  }

  
  saveSettings(): void {
    this.toastService.show('Promjene uspješno sačuvane', 'success');
  }

  resetSettings(): void {
    this.settingsService.resetSettings();
    this.toastService.show('Postavke vraćene na podrazumevano', 'success');
  }
}