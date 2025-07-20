import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class GameOverDialogComponent {
  @Input() title: string = '';
  @Input() text: string = '';

  @Output() close = new EventEmitter<boolean>();

  onClose(shouldReset: boolean): void {
    this.close.emit(shouldReset);
  }
}
