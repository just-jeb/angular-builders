import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

declare const buildText: string;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AppComponent {
  buildText = typeof buildText !== 'undefined' ? buildText : null;

  title = 'sanity-esbuild-app-esm: ' + this.buildText;
}
