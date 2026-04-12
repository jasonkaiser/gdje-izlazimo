import {
  Component, input, output, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rating-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingModal {
  readonly venueName    = input.required<string>();
  readonly isSubmitting = input<boolean>(false);

  readonly close  = output<void>();
  readonly submit = output<{ rating: number; comment: string }>();

  readonly hoveredStar = signal<number>(0);
  readonly selectedStar = signal<number>(0);
  comment = '';

  hoverStar(n: number): void  { this.hoveredStar.set(n); }
  clearHover(): void          { this.hoveredStar.set(0); }
  selectStar(n: number): void { this.selectedStar.set(n); }

  isActive(n: number): boolean {
    return n <= (this.hoveredStar() || this.selectedStar());
  }

  onSubmit(): void {
    if (!this.selectedStar()) return;
    this.submit.emit({
      rating: this.selectedStar(),
      comment: this.comment.trim(),
    });
  }
}