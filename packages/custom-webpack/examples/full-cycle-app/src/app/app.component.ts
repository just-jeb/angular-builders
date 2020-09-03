import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly version = APP_VERSION;

  title = 'full-cycle-app';

  ngOnInit() {
    console.log(this.version);
  }
}
