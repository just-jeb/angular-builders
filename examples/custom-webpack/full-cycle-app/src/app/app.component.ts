import { Component } from '@angular/core';
declare const APP_VERSION: string;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'full-cycle-app';
  version = APP_VERSION;
}
