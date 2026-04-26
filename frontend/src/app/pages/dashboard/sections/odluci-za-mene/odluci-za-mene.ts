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
  wheelVisible = false;
  wheelHiding = false;
  modalOpen = false;
  selectedVenue: WheelVenue | null = null;

  wheelVenues: WheelVenue[] = [];

  private ctx!: CanvasRenderingContext2D;
  private cctx!: CanvasRenderingContext2D;

  private rotation = -Math.PI / 2;
  private winnerIdx = -1;
  private spinning = false;
  private animFrame: number | null = null;
  private confettiRaf: number | null = null;
  private pulseRaf: number | null = null;
  private particles: Particle[] = [];

  private readonly size = 520;
  private readonly center = this.size / 2;
  private readonly radius = this.center - 18;
  private winPulseStartedAt = 0;
  private readonly tau = Math.PI * 2;
  private readonly pointerAngle = -Math.PI / 2;
  private readonly colors = ['#11111a', '#181824'];
  private readonly accent = '#7c3aed';
  private readonly fallbackImage =
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=75';
  private readonly confettiColors = [
    '#ffffff',
    '#f5f3ff',
    '#ddd6fe',
    '#c4b5fd',
    '#a78bfa',
    '#8b5cf6',
    '#fbbf24',
  ];

  private resizeHandler = () => this.resizeConfetti();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const wheelCtx = this.wheelCanvasRef.nativeElement.getContext('2d', { alpha: true });
    const confettiCtx = this.confettiCanvasRef.nativeElement.getContext('2d', { alpha: true });

    if (!wheelCtx || !confettiCtx) return;

    this.ctx = wheelCtx;
    this.cctx = confettiCtx;

    this.prepareVenues();
    this.resizeConfetti();
    this.drawWheel();

    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['venues']) {
      this.prepareVenues();
      this.drawWheel();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);

    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.confettiRaf) cancelAnimationFrame(this.confettiRaf);
    if (this.pulseRaf) cancelAnimationFrame(this.pulseRaf);
  }

  onTrigger(): void {
    if (this.spinning || this.wheelVenues.length === 0) return;

    this.selectedVenue = null;
    this.modalOpen = false;
    this.overlayActive = true;
    this.wheelHiding = false;
    this.wheelVisible = true;
    this.winPulseStartedAt = 0;
    this.cdr.markForCheck();

    setTimeout(() => this.spin(), 250);
  }

  onOverlayClick(): void {
    if (this.spinning) return;
    this.closeAll();
  }

  onModalClose(): void {
    this.closeAll();
  }

  onRetry(): void {
    if (this.wheelVenues.length === 0) return;

    this.modalOpen = false;
    this.selectedVenue = null;
    this.winPulseStartedAt = 0;
    this.stopConfetti();
    this.cdr.markForCheck();

    setTimeout(() => {
      this.wheelHiding = false;
      this.wheelVisible = true;
      this.cdr.markForCheck();

      setTimeout(() => this.spin(), 220);
    }, 250);
  }

  onIdemo(): void {
    if (this.selectedVenue) {
      this.decide.emit(this.selectedVenue.source);
    }

    this.closeAll();
  }

  private prepareVenues(): void {
    this.wheelVenues = (this.venues ?? [])
      .filter(Boolean)
      .map((venue) => this.mapVenue(venue));
  }

  private mapVenue(venue: VenueResponseDto): WheelVenue {
    const anyVenue = venue as any;

    const name = anyVenue.name ?? anyVenue.title ?? 'Nepoznat lokal';
    const category = anyVenue.venueType ?? anyVenue.category ?? 'Lokal';
    const location = anyVenue.city ?? anyVenue.location ?? anyVenue.address ?? 'Sarajevo';

    return {
      source: venue,
      name,
      tags: [category, location].filter(Boolean).join(' · '),
      info: anyVenue.description
        ? this.shorten(anyVenue.description, 70)
        : 'Pogledaj detalje lokala i odluči da li je ovo tvoja večer.',
      img:
        anyVenue.imageUrl ??
        anyVenue.coverImageUrl ??
        anyVenue.image ??
        anyVenue.logoUrl ??
        this.fallbackImage,
    };
  }

  private shorten(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max).trim()}...` : text;
  }

  private spin(): void {
    if (this.spinning || this.wheelVenues.length === 0) return;

    this.spinning = true;
    this.winnerIdx = Math.floor(Math.random() * this.wheelVenues.length);

    const segmentAngle = this.tau / this.wheelVenues.length;
    const winnerCenter = this.winnerIdx * segmentAngle;
    const currentWinnerPosition = this.normalize(this.rotation + winnerCenter);
    const neededDelta = this.normalize(this.pointerAngle - currentWinnerPosition);
    const extraSpins = this.tau * (5 + Math.floor(Math.random() * 3));
    const startRotation = this.rotation;
    const targetRotation = startRotation + extraSpins + neededDelta;
    const isMobile = window.innerWidth <= 640;
    const duration = isMobile ? 3200 : 4200;
    const start = performance.now();

    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 5);

      this.rotation = startRotation + (targetRotation - startRotation) * eased;
      this.drawWheel();

      if (t < 1) {
        this.animFrame = requestAnimationFrame(tick);
        return;
      }

      this.rotation = targetRotation;
      this.spinning = false;
      this.drawWheel();
      this.finishSpin();
    };

    this.animFrame = requestAnimationFrame(tick);
  }

  private finishSpin(): void {
    setTimeout(() => {
      this.winPulseStartedAt = performance.now();
      this.startWinnerPulse(780);

      this.wheelHiding = true;
      this.cdr.markForCheck();

      setTimeout(() => {
        this.fireConfetti();

        setTimeout(() => {
          this.wheelVisible = false;
          this.selectedVenue = this.wheelVenues[this.winnerIdx];
          this.modalOpen = true;
          this.cdr.markForCheck();
        }, 650);
      }, 720);
    }, 850);
  }

  private startWinnerPulse(duration: number): void {
    if (this.pulseRaf) cancelAnimationFrame(this.pulseRaf);

    const end = performance.now() + duration;

    const tick = () => {
      this.drawWheel();

      if (performance.now() < end) {
        this.pulseRaf = requestAnimationFrame(tick);
      } else {
        this.pulseRaf = null;
      }
    };

    tick();
  }

  private drawWheel(): void {
    if (!this.ctx || this.wheelVenues.length === 0) return;

    const ctx = this.ctx;
    const segmentAngle = this.tau / this.wheelVenues.length;

    ctx.clearRect(0, 0, this.size, this.size);

    ctx.save();
    ctx.translate(this.center, this.center);
    ctx.rotate(this.rotation);

    for (let i = 0; i < this.wheelVenues.length; i++) {
      const start = i * segmentAngle - segmentAngle / 2;
      const end = start + segmentAngle;
      const active = i === this.winnerIdx && !this.spinning;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.radius, start, end);
      ctx.closePath();

      if (active) {
        const elapsed = this.winPulseStartedAt ? performance.now() - this.winPulseStartedAt : 0;
        const pulse = this.winPulseStartedAt ? 0.5 + Math.sin(elapsed / 130) * 0.5 : 0;
        const glow = 0.16 + pulse * 0.18;

        ctx.fillStyle = '#24104a';
        ctx.fill();

        if (this.winPulseStartedAt) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(124, 58, 237, ${glow})`;
          ctx.fill();
          ctx.restore();
        }
      } else {
        ctx.fillStyle = this.colors[i % 2];
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const mid = start + segmentAngle / 2;
      const dotRadius = this.radius * 0.68;

      ctx.save();
      ctx.rotate(mid);
      ctx.translate(dotRadius, 0);

      ctx.beginPath();
      ctx.arc(0, 0, active ? 6 : 4, 0, this.tau);
      ctx.fillStyle = active ? '#c4b5fd' : 'rgba(255,255,255,0.32)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(this.center, this.center, this.radius + 3, 0, this.tau);
    ctx.strokeStyle = 'rgba(124,58,237,0.42)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.center, this.center, this.radius - 16, 0, this.tau);
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.center, this.center, 34, 0, this.tau);
    ctx.fillStyle = '#080811';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
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
    this.overlayActive = false;
    this.wheelVisible = false;
    this.wheelHiding = false;
    this.modalOpen = false;
    this.selectedVenue = null;
    this.spinning = false;
    this.winPulseStartedAt = 0;
    this.stopConfetti();

    if (this.pulseRaf) {
      cancelAnimationFrame(this.pulseRaf);
      this.pulseRaf = null;
    }

    this.cdr.markForCheck();
  }

  private resizeConfetti(): void {
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    if (this.cctx) {
      this.cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private fireConfetti(): void {
    const canvas = this.confettiCanvasRef.nativeElement;
    const isMobile = window.innerWidth <= 640;
    const count = isMobile ? 28 : 100;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.38;

    this.particles = [];

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.18;
      const speed = (isMobile ? 2.4 : 3) + Math.random() * (isMobile ? 4.5 : 6.5);

      this.particles.push({
        x: cx + (Math.random() - 0.5) * (isMobile ? 80 : 120),
        y: cy + (Math.random() - 0.5) * 36,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * this.tau,
        vrot: (Math.random() - 0.5) * 0.22,
        w: (isMobile ? 4 : 5) + Math.random() * (isMobile ? 6 : 8),
        h: 2 + Math.random() * 4,
        color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
        alpha: 1,
      });
    }

    this.animateConfetti();
  }

  private animateConfetti(): void {
    const canvas = this.confettiCanvasRef.nativeElement;
    const ctx = this.cctx;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 640;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const glowAlpha = Math.max(
      0,
      Math.min(1, this.particles.reduce((max, p) => Math.max(max, p.alpha), 0))
    );

    if (glowAlpha > 0 && !isMobile) {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height * 0.18,
        0,
        width / 2,
        height * 0.18,
        width * (isMobile ? 0.65 : 0.55)
      );

      gradient.addColorStop(0, `rgba(124, 58, 237, ${isMobile ? 0.18 * glowAlpha : 0.28 * glowAlpha})`);
      gradient.addColorStop(0.42, `rgba(124, 58, 237, ${isMobile ? 0.08 * glowAlpha : 0.12 * glowAlpha})`);
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    let alive = false;

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += isMobile ? 0.075 : 0.085;
      p.vx *= 0.986;
      p.rot += p.vrot;
      p.alpha -= isMobile ? 0.012 : 0.009;

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

    if (alive) {
      this.confettiRaf = requestAnimationFrame(() => this.animateConfetti());
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private stopConfetti(): void {
    if (this.confettiRaf) cancelAnimationFrame(this.confettiRaf);

    this.confettiRaf = null;
    this.particles = [];

    const canvas = this.confettiCanvasRef?.nativeElement;
    if (canvas && this.cctx) {
      this.cctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}