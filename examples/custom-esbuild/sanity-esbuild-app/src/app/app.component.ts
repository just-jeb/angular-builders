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
  buildText = typeof buildText !== 'undefined' ? buildText : '';

  title = this.buildText ? `sanity-esbuild-app: ${this.buildText}` : 'sanity-esbuild-app';
}
