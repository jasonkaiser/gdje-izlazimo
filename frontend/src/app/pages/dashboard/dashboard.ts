import { Component } from '@angular/core';
import { SearchBarComponent } from '../../components/other/search-bar/search-bar';
import { BgCardsMarqueeComponent } from '../../components/cards/bg-card/bg-card';
import { PopularVenuesCarouselComponent } from './sections/popular-venues/popular-venues';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SearchBarComponent, BgCardsMarqueeComponent, PopularVenuesCarouselComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  venues = [
    { id: 1, name: 'Viking Pub', imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=60&sat=-100' },
    { id: 2, name: 'Sloga', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=60&sat=-100' },
    { id: 3, name: 'Silver & Smoke', imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=60&sat=-100' },
    { id: 4, name: 'Underground', imageUrl: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?auto=format&fit=crop&w=1200&q=60&sat=-100' },
    { id: 5, name: 'Old Town Bar', imageUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=60&sat=-100' },
  ];

   popularVenues = [
    {
      title: 'Viking Pub',
      category: 'PUB',
      location: 'Hamdije Kreševljakovića 61',
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
    },
    {
      title: 'Tesla',
      category: 'CLUB',
      location: 'Sarajevo Center',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
    },
    {
      title: 'Cinema Sloga',
      category: 'PUB',
      location: 'Obala Kulina bana',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    },
    {
      title: 'Argelini',
      category: 'PUB',
      location: 'Vilsonovo',
      imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
    },
    {
      title: 'Silver',
      category: 'CLUB',
      location: 'Sarajevo Center',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
    },
  ];


}
