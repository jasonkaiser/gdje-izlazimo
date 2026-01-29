import { Component, Input } from '@angular/core';
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

  @Input() title : string = '';
  @Input() category : string = '';
  @Input() location : string = '';
  @Input() imageUrl : string = '';


}
