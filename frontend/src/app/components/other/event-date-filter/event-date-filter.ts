import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// ─── Date Helpers ────────────────────────────────────────────────────────────

export function formatLocalDate(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isSameDate(a: Date, b: Date): boolean {
  return formatLocalDate(a) === formatLocalDate(b);
}

export function getUpcomingWeekend(): { sat: Date; sun: Date } {
  const today  = new Date();
  const dow    = today.getDay();
  const dToSat = dow === 0 ? 6 : 6 - dow;
  const sat    = addDays(today, dToSat === 0 ? 0 : dToSat);
  const sun    = addDays(sat, 1);
  return { sat, sun };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuickChip = 'all' | 'tonight' | 'tomorrow' | 'weekend';

export interface DateFilterChange {
  dateFrom: string | null;
  dateTo:   string | null;
}

export interface DayItem {
  date:       Date;
  dayLabel:   string;
  dayNumber:  number;
  isToday:    boolean;
  isSelected: boolean;
  isWeekend:  boolean;
  isFriday:   boolean;
  hasEvents:  boolean;
}

const BA_DAYS: string[] = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
const BA_MONTHS: string[] = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-event-date-filter',
  standalone: true,
  templateUrl: './event-date-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDateFilterComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly filterChange = output<DateFilterChange>();

  // ── State ─────────────────────────────────────────────────────────────────

  readonly selectedDate = signal<string | null>(null);

  /** Month offset: 0 = current month, 1 = next, etc. */
  readonly weekOffset = signal<number>(0);

  readonly today = new Date();
  readonly eventDates = input<string[]>([]); 

  // ── Chips config ──────────────────────────────────────────────────────────

  readonly chips: { value: QuickChip; label: string }[] = [
    { value: 'all',      label: 'Sve'         },
    { value: 'tonight',  label: 'Večeras'     },
    { value: 'tomorrow', label: 'Sutra'       },
    { value: 'weekend',  label: 'Ovaj vikend' },
  ];

  // ── Derived ──────────────────────────────────────────────────────────────

  readonly activeChip = computed<QuickChip | null>(() => {
    const sel = this.selectedDate();
    if (!sel) return 'all';

    const todayStr = formatLocalDate(this.today);
    const tomorStr = formatLocalDate(addDays(this.today, 1));
    const { sat, sun } = getUpcomingWeekend();

    if (sel === todayStr) return 'tonight';
    if (sel === tomorStr) return 'tomorrow';

    const selDate = parseLocalDate(sel);
    if (isSameDate(selDate, sat) || isSameDate(selDate, sun)) return 'weekend';

    return null;
  });

  readonly monthLabel = computed<string>(() => {
    const base = new Date(
      this.today.getFullYear(),
      this.today.getMonth() + this.weekOffset(),
      1
    );
    return `${BA_MONTHS[base.getMonth()]} ${base.getFullYear()}`;
  });

 readonly days = computed<DayItem[]>(() => {
  const sel        = this.selectedDate();
  const eventSet   = new Set(this.eventDates());
  const base = new Date(
    this.today.getFullYear(),
    this.today.getMonth() + this.weekOffset(),
    1
  );

  const start    = this.weekOffset() === 0 ? this.today : base;
  const monthEnd = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const count    = Math.max(
    1,
    Math.floor((monthEnd.getTime() - start.getTime()) / 86_400_000) + 1
  );

  return Array.from({ length: count }, (_, i) => {
    const date = addDays(start, i);
    const dow  = date.getDay();
    const iso  = formatLocalDate(date);
    return {
      date,
      dayLabel:   BA_DAYS[dow],
      dayNumber:  date.getDate(),
      isToday:    isSameDate(date, this.today),
      isSelected: sel ? iso === sel : false,
      isWeekend:  dow === 0 || dow === 6,
      isFriday:   dow === 5,
      hasEvents:  eventSet.has(iso),
    };
  });
});

  // ── Init ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const p        = this.route.snapshot.queryParamMap;
    const dateFrom = p.get('dateFrom');
    const dateTo   = p.get('dateTo');

    if (dateFrom && dateTo && dateFrom === dateTo) {
      this.selectedDate.set(dateFrom);
    } else {
      this.selectedDate.set(null);
    }
  }

  // ── Chip actions ─────────────────────────────────────────────────────────

  selectChip(chip: QuickChip): void {
    const todayStr = formatLocalDate(this.today);
    const tomorStr = formatLocalDate(addDays(this.today, 1));
    const { sat, sun } = getUpcomingWeekend();

    switch (chip) {
      case 'all':
        this.selectedDate.set(null);
        this.filterChange.emit({ dateFrom: null, dateTo: null });
        break;
      case 'tonight':
        this.selectedDate.set(todayStr);
        this.filterChange.emit({ dateFrom: todayStr, dateTo: todayStr });
        break;
      case 'tomorrow':
        this.selectedDate.set(tomorStr);
        this.filterChange.emit({ dateFrom: tomorStr, dateTo: tomorStr });
        break;
      case 'weekend':
        this.selectedDate.set(formatLocalDate(sat));
        this.filterChange.emit({
          dateFrom: formatLocalDate(sat),
          dateTo:   formatLocalDate(sun),
        });
        break;
    }
  }

  // ── Calendar actions ──────────────────────────────────────────────────────

  selectDay(day: DayItem): void {
    const iso = formatLocalDate(day.date);
    this.selectedDate.set(iso);
    this.filterChange.emit({ dateFrom: iso, dateTo: iso });
  }

  prevMonth(): void {
    if (this.weekOffset() > 0) this.weekOffset.update(v => v - 1);
  }

  nextMonth(): void {
    this.weekOffset.update(v => v + 1);
  }

  // ── Style helpers ─────────────────────────────────────────────────────────

  chipClass(chip: QuickChip): string {
  const active = this.activeChip() === chip;
  return [
    'inline-flex items-center px-[14px] py-[8px] rounded-full',
    'font-dm text-[11px] tracking-[0.12em] uppercase whitespace-nowrap',
    'border transition-all duration-200',
    active
      ? 'border-violet-500/40 bg-violet-600/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
      : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.07] hover:border-white/[0.12]',
  ].join(' ');
}

dayClass(day: DayItem): string {
  const base = [
    'snap-start shrink-0 sm:w-auto sm:flex-1 sm:shrink',
    'w-[calc((100vw-62px)/6)]',
    'flex flex-col items-center justify-center',
    'py-3.5 rounded-2xl min-w-0',
    'border transition-all duration-150 cursor-pointer select-none',
  ];

  if (day.isSelected) {
    base.push(
      'border-violet-500/50 bg-violet-600/[0.22] text-white',
      'shadow-[0_0_16px_rgba(139,92,246,0.18)]'
    );
  } else if (day.isToday) {
    base.push('border-white/[0.12] bg-white/[0.05] text-white');
  } else {
    base.push(
      'border-white/[0.05] bg-white/[0.01] text-white/60',
      'hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.10]'
    );
  }

  return base.join(' ');
}
}