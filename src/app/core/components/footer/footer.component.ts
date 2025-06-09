import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  @Input() background: string = "linear-gradient(135deg, #ffd700 0%, #ffb347 30%, #ffa500 70%, #ff8f00 100%)";
  @Input() radiant: string = "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)";
}
