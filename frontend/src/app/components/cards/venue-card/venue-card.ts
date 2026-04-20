import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { Badge } from "../../other/badge/badge";
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-venue-card',
  imports: [ButtonComponent, Badge, DecimalPipe],
  templateUrl: './venue-card.html',
  standalone: true,
  styleUrl: './venue-card.css',
})
export class VenueCard {
  @Input() id: string = '';
  @Input() title: string = '';
  @Input() category: string = '';
  @Input() location: string = '';
  @Input() imageUrl: string = '';
  @Input() averageRating: number = 0;
  @Input() totalRatings: number = 0;

  constructor(private router: Router) {}


  onViewDetails(): void {
    if (this.id) {
      this.router.navigate(['/venues', this.id]);
    }
  }
}