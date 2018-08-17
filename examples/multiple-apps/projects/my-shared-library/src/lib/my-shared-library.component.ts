import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-my-shared-library',
  template: `
    <p>
      my-shared-library works!
    </p>
  `,
  styles: []
})
export class MySharedLibraryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
