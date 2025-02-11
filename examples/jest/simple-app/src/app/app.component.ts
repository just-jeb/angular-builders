import { Component } from '@angular/core';
import { LinkComponent } from './link/link.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [LinkComponent],
})
export class AppComponent {
  title = 'simple-app';
}
