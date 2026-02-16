// activity-logs-modal.component.ts

import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ModalService } from '../../../core/services/modal';
import { ActivityLog } from '../../../core/api/dashboard-service';

@Component({
  selector: 'app-activity-logs-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs-modal.html',
  styleUrls: ['./activity-logs-modal.css']
})
export class ActivityLogsModalComponent {
  @Input() data!: { activities: ActivityLog[] };

  private readonly modalService = inject(ModalService);

  get activities(): ActivityLog[] {
    return this.data?.activities || [];
  }

  close(): void {
    this.modalService.close();
  }

  getActivityTime(activity: ActivityLog): string {
    const anyA = activity as any;
    return anyA.createdAt ?? anyA.timestamp ?? anyA.time ?? '';
  }

  getActivityIcon(entityType: string): string {
    const icons: Record<string, string> = {
      USER: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      VENUE: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      RESERVATION: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      TABLE_TYPE: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      SYSTEM: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[entityType] || icons['SYSTEM'];
  }

  getActivityBadgeClass(entityType: string): string {
    const classes: Record<string, string> = {
      USER: 'bg-blue-500/10 border-blue-500/25',
      VENUE: 'bg-violet-500/10 border-violet-500/25',
      RESERVATION: 'bg-amber-500/10 border-amber-500/25',
      TABLE_TYPE: 'bg-teal-500/10 border-teal-500/25',
      SYSTEM: 'bg-white/5 border-white/10',
    };
    return classes[entityType] || classes['SYSTEM'];
  }

  getActivityIconClass(entityType: string): string {
    const classes: Record<string, string> = {
      USER: 'text-blue-400',
      VENUE: 'text-violet-400',
      RESERVATION: 'text-amber-400',
      TABLE_TYPE: 'text-teal-400',
      SYSTEM: 'text-white/40',
    };
    return classes[entityType] || classes['SYSTEM'];
  }

  getEntityTypeBadge(entityType: string): string {
    const badges: Record<string, string> = {
      USER: 'border-blue-500/20 bg-blue-500/[0.08] text-blue-400',
      VENUE: 'border-violet-500/20 bg-violet-500/[0.08] text-violet-400',
      RESERVATION: 'border-amber-500/20 bg-amber-500/[0.08] text-amber-400',
      TABLE_TYPE: 'border-teal-500/20 bg-teal-500/[0.08] text-teal-400',
      SYSTEM: 'border-white/10 bg-white/[0.04] text-white/40',
    };
    return badges[entityType] || badges['SYSTEM'];
  }

  getEntityTypeLabel(entityType: string): string {
    const labels: Record<string, string> = {
      USER: 'Korisnik',
      VENUE: 'Lokal',
      RESERVATION: 'Rezervacija',
      TABLE_TYPE: 'Tip Stola',
      SYSTEM: 'Sistem',
    };
    return labels[entityType] || entityType;
  }

  formatRelativeTime(dateStr: string): string {
    if (!dateStr) return 'Nedavno';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Nedavno';

    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Upravo sada';
    if (diffMin < 60) return `Prije ${diffMin} min`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Prije ${diffH} h`;

    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Juče';
    if (diffD < 7) return `Prije ${diffD} dana`;
    if (diffD < 30) return `Prije ${Math.floor(diffD / 7)} sedmica`;

    return date.toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}