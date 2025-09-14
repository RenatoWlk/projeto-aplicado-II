import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  sloganTrigger: EventEmitter<void> = new EventEmitter<void>();

  triggerSloganChange() {
    this.sloganTrigger.emit();
  }
}
