import { NgModule } from '@angular/core';
import { MySharedLibraryComponent } from './my-shared-library.component';

@NgModule({
  imports: [
  ],
  declarations: [MySharedLibraryComponent],
  exports: [MySharedLibraryComponent]
})
export class MySharedLibraryModule { }
