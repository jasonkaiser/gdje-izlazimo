import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { VenueService } from '../../core/api/venue-service';
import { VenueMapComponent } from '../../components/other/venue-map/venue-map';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venue-map-page',
  standalone: true,
  imports: [VenueMapComponent, CommonModule],
  templateUrl: './venue-map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VenueMapPage implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly cdr = inject(ChangeDetectorRef);

  venues: Array<{ lat: number; lng: number; name: string; address: string }> = [];
  loading = true;

  ngOnInit(): void {
    this.venueService.getVenues( {pageSize: 1000 }).subscribe({
      next: (venues) => {
        this.venues = venues
          .filter(v => v.latitude && v.longitude)
          .map(v => ({
            lat: v.latitude,
            lng: v.longitude,
            name: v.name ?? '',
            address: v.addressName ?? '',
          }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}