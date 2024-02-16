import { Component } from '@angular/core';

declare const title: string;
declare const subtitle: string;
declare const titleByOption: string;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
})
export class AppComponent {
  title: string;
  subtitle: string;
  titleByOption: string;

  constructor() {
    this.title = typeof title !== 'undefined' ? title : 'sanity-esbuild-app';
    this.subtitle = typeof subtitle !== 'undefined' ? subtitle : 'sanity-esbuild-app subtitle';
    this.titleByOption = typeof titleByOption !== 'undefined' ? titleByOption : 'sanity-esbuild-app optionTitle';
  }
}
