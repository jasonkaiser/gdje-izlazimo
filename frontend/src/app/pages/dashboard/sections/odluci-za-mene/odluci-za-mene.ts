import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnChanges,
  SimpleChanges,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueResponseDto } from '../../../../core/models/venues/venue-response.dto';

interface WheelVenue {
  source: VenueResponseDto;
  name: string;
  tags: string;
  info: string;
  img: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
}

// ─── Fixed logical drawing size ───────────────────────────────────────────────
// The canvas bitmap is always DRAW_SIZE × DRAW_SIZE.
// CSS inside .wheel-shell makes it fill the shell via object-fit / width:100%.
// DPR sharpness is handled by scaling the bitmap by window.devicePixelRatio.
const DRAW_SIZE = 520;

@Component({
  selector: 'app-odluci-za-mene',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './odluci-za-mene.html',
  styleUrl: './odluci-za-mene.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OdluciZaMeneComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() venues: VenueResponseDto[] = [];
  @Output() decide = new EventEmitter<VenueResponseDto>();

  @ViewChild('wheelCanvas') wheelCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('confettiCanvas') confettiCanvasRef!: ElementRef<HTMLCanvasElement>;

  overlayActive = false;
  wheelVisible  = false;
  wheelHiding   = false;
  modalOpen     = false;
  selectedVenue: WheelVenue | null = null;

  wheelVenues: WheelVenue[] = [];

  private ctx!:  CanvasRenderingContext2D;
  private cctx!: CanvasRenderingContext2D;

  private baseWheelCanvas: HTMLCanvasElement | null = null;
  private baseWheelDirty = true;

  private rotation  = -Math.PI / 2;
  private winnerIdx = -1;
  private spinning  = false;

  private animFrame:   number | null = null;
  private confettiRaf: number | null = null;
  private pulseRaf:    number | null = null;
  private particles: Particle[] = [];

  // All drawing uses these fixed logical constants.
  // The canvas element is sized to DRAW_SIZE × DRAW_SIZE logical px (× DPR for bitmap).
  // CSS width:100% / height:100% on the canvas element makes it fill the shell visually.
  private readonly size   = DRAW_SIZE;
  private readonly center = DRAW_SIZE / 2;       // 260
  private readonly radius = DRAW_SIZE / 2 - 18;  // 242

  private readonly tau          = Math.PI * 2;
  private readonly pointerAngle = -Math.PI / 2;

  private winPulseStartedAt = 0;

  private readonly colors = ['#11111a', '#181824'];
  private readonly accent = '#7c3aed';

  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=75';

  private readonly confettiColors = [
    '#ffffff', '#f5f3ff', '#ddd6fe', '#c4b5fd',
    '#a78bfa', '#8b5cf6', '#fbbf24',
  ];

  private resizeHandler = () => this.resizeConfetti();

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    const el = this.wheelCanvasRef.nativeElement;

    // ── Set canvas bitmap resolution once, here, permanently ──────────────
    // Always DRAW_SIZE logical px × DPR physical px.
    // CSS (width:100%; height:100%) stretches the element to fill the shell,
    // which is fine — the browser scales the bitmap to match CSS size.
    const dpr   = Math.min(window.devicePixelRatio || 1, 3);
    el.width    = Math.round(DRAW_SIZE * dpr);
    el.height   = Math.round(DRAW_SIZE * dpr);

    const wheelCtx = el.getContext('2d', {
      alpha: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings);

    const confettiCtx = this.confettiCanvasRef.nativeElement.getContext('2d', {
      alpha: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings);

    if (!wheelCtx || !confettiCtx) return;

    this.ctx  = wheelCtx;
    this.cctx = confettiCtx;

    // Scale context once so every draw call uses logical px (DRAW_SIZE coords).
    this.ctx.scale(dpr, dpr);

    this.prepareVenues();
    this.rebuildBaseWheel();
    this.resizeConfetti();
    this.drawWheel();

    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['venues']) {
      this.prepareVenues();
      this.baseWheelDirty = true;

      if (this.ctx) {
        this.rebuildBaseWheel();
        this.drawWheel();
      }

      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    if (this.animFrame)   cancelAnimationFrame(this.animFrame);
    if (this.confettiRaf) cancelAnimationFrame(this.confettiRaf);
    if (this.pulseRaf)    cancelAnimationFrame(this.pulseRaf);
  }

  // ── Public event handlers ─────────────────────────────────────────────────

  onTrigger(): void {
    if (this.spinning || this.wheelVenues.length === 0) return;

    this.selectedVenue     = null;
    this.modalOpen         = false;
    this.overlayActive     = true;
    this.wheelHiding       = false;
    this.wheelVisible      = true;
    this.winPulseStartedAt = 0;

    this.cdr.markForCheck();
    window.setTimeout(() => this.spin(), 180);
  }

  onOverlayClick(): void {
    if (this.spinning) return;
    this.closeAll();
  }

  onModalClose(): void { this.closeAll(); }

  onRetry(): void {
    if (this.wheelVenues.length === 0) return;

    this.modalOpen         = false;
    this.selectedVenue     = null;
    this.winPulseStartedAt = 0;
    this.stopConfetti();
    this.cdr.markForCheck();

    window.setTimeout(() => {
      this.wheelHiding  = false;
      this.wheelVisible = true;
      this.cdr.markForCheck();
      window.setTimeout(() => this.spin(), 180);
    }, 220);
  }

  onIdemo(): void {
    if (this.selectedVenue) this.decide.emit(this.selectedVenue.source);
    this.closeAll();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private prepareVenues(): void {
    this.wheelVenues = (this.venues ?? [])
      .filter(Boolean)
      .map(v => this.mapVenue(v));
  }

  private mapVenue(venue: VenueResponseDto): WheelVenue {
    const v = venue as any;
    return {
      source: venue,
      name:   v.name      ?? v.title    ?? 'Nepoznat lokal',
      tags:   [v.venueType ?? v.category ?? 'Lokal', v.city ?? v.location ?? v.address ?? 'Sarajevo'].filter(Boolean).join(' · '),
      info:   v.description ? this.shorten(v.description, 70) : 'Pogledaj detalje lokala i odluči da li je ovo tvoja večer.',
      img:    v.imageUrl ?? v.coverImageUrl ?? v.image ?? v.logoUrl ?? this.fallbackImage,
    };
  }

  private shorten(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max).trim()}...` : text;
  }

  private spin(): void {
    if (this.spinning || this.wheelVenues.length === 0) return;

    this.spinning          = true;
    this.winnerIdx         = Math.floor(Math.random() * this.wheelVenues.length);
    this.winPulseStartedAt = 0;

    const segmentAngle          = this.tau / this.wheelVenues.length;
    const winnerCenter          = this.winnerIdx * segmentAngle;
    const currentWinnerPosition = this.normalize(this.rotation + winnerCenter);
    const neededDelta           = this.normalize(this.pointerAngle - currentWinnerPosition);

    const isMobile       = window.innerWidth <= 640;
    const extraSpins     = this.tau * (isMobile ? 4 : 6);
    const startRotation  = this.rotation;
    const targetRotation = startRotation + extraSpins + neededDelta;
    const duration       = isMobile ? 3000 : 4100;
    const start          = performance.now();

    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const t     = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);

        this.rotation = startRotation + (targetRotation - startRotation) * eased;
        this.drawWheel();

        if (t < 1) { this.animFrame = requestAnimationFrame(tick); return; }

        this.rotation = targetRotation;
        this.spinning = false;
        this.drawWheel();
        this.finishSpin();
      };
      this.animFrame = requestAnimationFrame(tick);
    });
  }

  private finishSpin(): void {
    window.setTimeout(() => {
      this.winPulseStartedAt = performance.now();
      this.startWinnerPulse(window.innerWidth <= 640 ? 520 : 760);

      this.wheelHiding = true;
      this.cdr.markForCheck();

      window.setTimeout(() => {
        this.fireConfetti();
        window.setTimeout(() => {
          this.wheelVisible  = false;
          this.selectedVenue = this.wheelVenues[this.winnerIdx];
          this.modalOpen     = true;
          this.cdr.markForCheck();
        }, 520);
      }, 520);
    }, 420);
  }

  private startWinnerPulse(duration: number): void {
    if (this.pulseRaf) cancelAnimationFrame(this.pulseRaf);
    const end = performance.now() + duration;

    this.zone.runOutsideAngular(() => {
      const tick = () => {
        this.drawWheel();
        if (performance.now() < end) { this.pulseRaf = requestAnimationFrame(tick); }
        else { this.pulseRaf = null; }
      };
      tick();
    });
  }

  // Offscreen cache — drawn at DRAW_SIZE × DRAW_SIZE in logical px, no DPR needed here.
  // When blitted via drawImage() at the same logical size, the main ctx's scale(dpr,dpr)
  // ensures it renders sharply on high-DPR screens.
  private rebuildBaseWheel(): void {
    if (!this.wheelVenues.length) return;

    const canvas  = document.createElement('canvas');
    canvas.width  = this.size;
    canvas.height = this.size;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const segmentAngle = this.tau / this.wheelVenues.length;

    ctx.clearRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(this.center, this.center);

    for (let i = 0; i < this.wheelVenues.length; i++) {
      const start = i * segmentAngle - segmentAngle / 2;
      const end   = start + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.radius, start, end);
      ctx.closePath();
      ctx.fillStyle = this.colors[i % 2];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      const mid       = start + segmentAngle / 2;
      const dotRadius = this.radius * 0.68;
      ctx.save();
      ctx.rotate(mid);
      ctx.translate(dotRadius, 0);
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, this.tau);
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 3, 0, this.tau);
    ctx.strokeStyle = 'rgba(124,58,237,0.42)';
    ctx.lineWidth   = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 16, 0, this.tau);
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    ctx.restore();

    this.baseWheelCanvas = canvas;
    this.baseWheelDirty  = false;
  }

  private drawWheel(): void {
    if (!this.ctx || this.wheelVenues.length === 0) return;
    if (this.baseWheelDirty || !this.baseWheelCanvas) this.rebuildBaseWheel();

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);

    ctx.save();
    ctx.translate(this.center, this.center);
    ctx.rotate(this.rotation);

    if (this.baseWheelCanvas) {
      ctx.drawImage(this.baseWheelCanvas, -this.center, -this.center, this.size, this.size);
    }

    if (!this.spinning && this.winnerIdx >= 0) this.drawWinnerHighlight(ctx);

    ctx.restore();
    this.drawCenterPin(ctx);
  }

  private drawWinnerHighlight(ctx: CanvasRenderingContext2D): void {
    const segmentAngle = this.tau / this.wheelVenues.length;
    const start        = this.winnerIdx * segmentAngle - segmentAngle / 2;
    const end          = start + segmentAngle;
    const elapsed      = this.winPulseStartedAt ? performance.now() - this.winPulseStartedAt : 0;
    const pulse        = this.winPulseStartedAt ? 0.5 + Math.sin(elapsed / 120) * 0.5 : 0;
    const glow         = this.winPulseStartedAt ? 0.13 + pulse * 0.16 : 0.1;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius, start, end);
    ctx.closePath();
    ctx.fillStyle = '#24104a';
    ctx.fill();

    if (this.winPulseStartedAt) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(124, 58, 237, ${glow})`;
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    const mid       = start + segmentAngle / 2;
    const dotRadius = this.radius * 0.68;
    ctx.rotate(mid);
    ctx.translate(dotRadius, 0);
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, this.tau);
    ctx.fillStyle = '#c4b5fd';
    ctx.fill();

    ctx.restore();
  }

  private drawCenterPin(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.center, this.center, 34, 0, this.tau);
    ctx.fillStyle   = '#080811';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.center, this.center, 7, 0, this.tau);
    ctx.fillStyle = this.accent;
    ctx.fill();
  }

  private normalize(angle: number): number {
    return ((angle % this.tau) + this.tau) % this.tau;
  }

  private closeAll(): void {
    this.overlayActive     = false;
    this.wheelVisible      = false;
    this.wheelHiding       = false;
    this.modalOpen         = false;
    this.selectedVenue     = null;
    this.spinning          = false;
    this.winPulseStartedAt = 0;
    this.stopConfetti();

    if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
    if (this.pulseRaf)  { cancelAnimationFrame(this.pulseRaf);  this.pulseRaf  = null; }

    this.cdr.markForCheck();
  }

  private resizeConfetti(): void {
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (!canvas) return;

    const isMobile = window.innerWidth <= 640;
    const dpr      = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width        = Math.floor(window.innerWidth  * dpr);
    canvas.height       = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    if (this.cctx) this.cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private fireConfetti(): void {
    const isMobile = window.innerWidth <= 640;
    const count    = isMobile ? 24 : 90;
    const cx       = window.innerWidth  / 2;
    const cy       = window.innerHeight * 0.36;

    this.particles = [];

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.12;
      const speed = (isMobile ? 2.2 : 3) + Math.random() * (isMobile ? 3.8 : 6);

      this.particles.push({
        x:     cx + (Math.random() - 0.5) * (isMobile ? 70 : 120),
        y:     cy + (Math.random() - 0.5) * 34,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        rot:   Math.random() * this.tau,
        vrot:  (Math.random() - 0.5) * 0.2,
        w:     (isMobile ? 4 : 5) + Math.random() * (isMobile ? 5 : 8),
        h:     2 + Math.random() * 4,
        color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
        alpha: 1,
      });
    }

    this.animateConfetti();
  }

  private animateConfetti(): void {
    const canvas   = this.confettiCanvasRef.nativeElement;
    const ctx      = this.cctx;
    const width    = window.innerWidth;
    const height   = window.innerHeight;
    const isMobile = width <= 640;

    this.zone.runOutsideAngular(() => {
      const tick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!isMobile) {
          const glowAlpha = Math.max(0, Math.min(1, this.particles.reduce((m, p) => Math.max(m, p.alpha), 0)));
          if (glowAlpha > 0) {
            const g = ctx.createRadialGradient(width / 2, height * 0.18, 0, width / 2, height * 0.18, width * 0.55);
            g.addColorStop(0,    `rgba(124,58,237,${0.25 * glowAlpha})`);
            g.addColorStop(0.42, `rgba(124,58,237,${0.1  * glowAlpha})`);
            g.addColorStop(1,    'rgba(124,58,237,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);
          }
        }

        let alive = false;
        for (const p of this.particles) {
          p.x   += p.vx;
          p.y   += p.vy;
          p.vy  += isMobile ? 0.075 : 0.085;
          p.vx  *= 0.986;
          p.rot += p.vrot;
          p.alpha -= isMobile ? 0.016 : 0.01;

          if (p.alpha <= 0) continue;
          alive = true;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }

        if (alive) { this.confettiRaf = requestAnimationFrame(tick); }
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); this.confettiRaf = null; }
      };

      if (this.confettiRaf) cancelAnimationFrame(this.confettiRaf);
      this.confettiRaf = requestAnimationFrame(tick);
    });
  }

  private stopConfetti(): void {
    if (this.confettiRaf) cancelAnimationFrame(this.confettiRaf);
    this.confettiRaf = null;
    this.particles   = [];
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (canvas && this.cctx) this.cctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}