import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-preloader',
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss'
})
export class PreloaderComponent {
  @Input() visible: boolean = true;
  @Input() type: 'spinner' | 'skeleton-cards' = 'spinner';
  @Input() count: number = 3;
  @Input() size: 'small' | 'medium' | 'large' = 'large';

  createArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
