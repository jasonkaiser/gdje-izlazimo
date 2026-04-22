import {
  Component,
  Input,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  NgZone,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-venue-map',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="relative rounded-3xl border border-white/[0.07] bg-white/[0.02]">

      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px z-10"
        style="background: linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent);"></div>

      <div class="px-6 pt-6 pb-4">
        <p class="font-dm text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">Lokacija</p>
        <p class="font-dm text-[13px] text-white/40">{{ address }}</p>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.05);">
        <div #mapContainer style="width: 100%; height: 340px;"></div>
      </div>

      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-violet-400 animate-pulse"
            style="box-shadow: 0 0 8px rgba(167,139,250,0.6);"></span>
          <span class="font-dm text-[11px] text-white/30">
            {{ lat | number:'1.4-4' }}, {{ lng | number:'1.4-4' }}
          </span>
        </div>
        <a [href]="googleMapsUrl" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-dm text-[11px] font-medium text-violet-300
                 transition-all duration-200 hover:scale-[1.02]"
          style="border: 1px solid rgba(124,58,237,0.35); background: rgba(124,58,237,0.12);">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Otvori u Google Maps
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueMapComponent implements AfterViewInit, OnDestroy {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() venueName = '';
  @Input() address = '';
  @Input() venues: Array<{ lat: number; lng: number; name: string; address: string }> = [];

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map: any;
  private readonly ngZone = inject(NgZone);

  get googleMapsUrl(): string {
    if (this.venues.length > 0) {
      return `https://www.google.com/maps/search/?api=1&query=kafici+sarajevo`;
    }
    return `https://www.google.com/maps?q=${this.lat},${this.lng}`;
  }

  async ngAfterViewInit(): Promise<void> {
  const leaflet = await import('leaflet');
  const L = (leaflet as any).default ?? leaflet;

  const hasVenues = this.venues?.length > 0;

  const center: [number, number] = hasVenues
    ? [this.venues[0].lat, this.venues[0].lng]
    : [this.lat, this.lng];

  this.ngZone.runOutsideAngular(() => {
    this.map = L.map(this.mapContainer.nativeElement, {
      center,
      zoom: hasVenues ? 14 : 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="position: relative; width: 36px; height: 36px;">
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            border: 2px solid rgba(167,139,250,0.7);
            box-shadow: 0 0 24px rgba(124,58,237,0.7), 0 4px 16px rgba(0,0,0,0.6);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            box-shadow: 0 0 6px rgba(255,255,255,0.8);
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -40],
    });

    if (hasVenues) {
      for (const venue of this.venues) {
        const marker = L.marker([venue.lat, venue.lng], { icon }).addTo(this.map);

        marker.bindPopup(`
          <div style="
            background: rgba(14,12,22,0.97);
            border: 1px solid rgba(124,58,237,0.4);
            border-radius: 12px;
            padding: 10px 14px;
            font-family: 'DM Sans', sans-serif;
            color: rgba(255,255,255,0.85);
            font-size: 13px;
            font-weight: 600;
            min-width: 140px;
            box-shadow: 0 8px 32px rgba(124,58,237,0.25);
          ">
            ${venue.name}
            <div style="
              font-size: 11px;
              color: rgba(255,255,255,0.35);
              font-weight: 400;
              margin-top: 3px;
            ">
              ${venue.address}
            </div>
          </div>
        `, {
          className: 'venue-popup',
          closeButton: false,
        });
      }

      if (this.venues.length > 1) {
        const bounds = L.latLngBounds(this.venues.map(v => [v.lat, v.lng] as [number, number]));
        this.map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      const marker = L.marker([this.lat, this.lng], { icon }).addTo(this.map);

      marker.bindPopup(`
        <div style="
          background: rgba(14,12,22,0.97);
          border: 1px solid rgba(124,58,237,0.4);
          border-radius: 12px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          font-weight: 600;
          min-width: 140px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.25);
        ">
          ${this.venueName}
          <div style="
            font-size: 11px;
            color: rgba(255,255,255,0.35);
            font-weight: 400;
            margin-top: 3px;
          ">
            ${this.address}
          </div>
        </div>
      `, {
        className: 'venue-popup',
        closeButton: false,
      }).openPopup();
    }

    setTimeout(() => this.map.invalidateSize(), 0);
    setTimeout(() => this.map.invalidateSize(), 150);
    setTimeout(() => this.map.invalidateSize(), 400);
  });
}

  ngOnDestroy(): void {
    this.map?.remove();
  }
}