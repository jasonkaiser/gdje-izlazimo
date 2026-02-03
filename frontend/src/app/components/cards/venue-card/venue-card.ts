import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { Badge } from "../../other/badge/badge";

@Component({
  selector: 'app-venue-card',
  imports: [ButtonComponent, Badge],
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

  constructor(private router: Router) {}


  onViewDetails(): void {
    if (this.id) {
      this.router.navigate(['/venues', this.id]);
    }
  }
}