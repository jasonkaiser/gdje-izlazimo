import { Injectable, signal } from '@angular/core';

export interface PlatformSettings {
  // Platform Settings
  platformName: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;

  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  // Reservation Settings
  maxAdvanceBookingDays: number;
  minAdvanceNoticeHours: number;
  defaultDurationHours: number;

  // System Info (read-only)
  version: string;
  apiStatus: 'active' | 'inactive';
  databaseStatus: 'connected' | 'disconnected';
  uptime: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'Gdje-Izlazimo',
  maintenanceMode: false,
  allowNewRegistrations: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  maxAdvanceBookingDays: 30,
  minAdvanceNoticeHours: 2,
  defaultDurationHours: 2,
  version: 'v1.0.0',
  apiStatus: 'active',
  databaseStatus: 'connected',
  uptime: '99.9%'
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  
  private readonly _settings = signal<PlatformSettings>(this.loadSettings());

  readonly settings = this._settings.asReadonly();

  private loadSettings(): PlatformSettings {
    // Load from localStorage if available, otherwise use defaults
    const stored = localStorage.getItem('platform-settings');
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch (e) {
        console.error('[SettingsService] Failed to parse stored settings:', e);
      }
    }
    return DEFAULT_SETTINGS;
  }

  updateSettings(partial: Partial<PlatformSettings>): void {
    const current = this._settings();
    const updated = { ...current, ...partial };
    
    // Don't allow changing read-only system info
    updated.version = current.version;
    updated.apiStatus = current.apiStatus;
    updated.databaseStatus = current.databaseStatus;
    updated.uptime = current.uptime;

    this._settings.set(updated);
    this.saveSettings(updated);
  }

  private saveSettings(settings: PlatformSettings): void {
    try {
      localStorage.setItem('platform-settings', JSON.stringify(settings));
    } catch (e) {
      console.error('[SettingsService] Failed to save settings:', e);
    }
  }

  resetSettings(): void {
    this._settings.set(DEFAULT_SETTINGS);
    this.saveSettings(DEFAULT_SETTINGS);
  }

  // Individual toggle methods for convenience
  toggleMaintenanceMode(): void {
    const current = this._settings();
    this.updateSettings({ maintenanceMode: !current.maintenanceMode });
  }

  toggleNewRegistrations(): void {
    const current = this._settings();
    this.updateSettings({ allowNewRegistrations: !current.allowNewRegistrations });
  }

  toggleEmailNotifications(): void {
    const current = this._settings();
    this.updateSettings({ emailNotifications: !current.emailNotifications });
  }

  toggleSmsNotifications(): void {
    const current = this._settings();
    this.updateSettings({ smsNotifications: !current.smsNotifications });
  }

  togglePushNotifications(): void {
    const current = this._settings();
    this.updateSettings({ pushNotifications: !current.pushNotifications });
  }
}