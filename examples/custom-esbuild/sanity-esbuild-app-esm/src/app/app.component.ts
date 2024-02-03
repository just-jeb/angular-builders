import { Component } from '@angular/core';

declare const title: string;
declare const subtitle: string;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
})
export class AppComponent {
  title: string;
  subtitle: string;

  constructor() {
    this.title = typeof title !== 'undefined' ? title : 'sanity-esbuild-app-esm';
    this.subtitle = typeof subtitle !== 'undefined' ? subtitle : 'sanity-esbuild-app-esm subtitle';
  }
}
