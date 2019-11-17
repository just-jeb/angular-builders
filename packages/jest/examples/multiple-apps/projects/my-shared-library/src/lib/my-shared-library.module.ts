import { NgModule } from '@angular/core';
import { MySharedLibraryComponent } from './my-shared-library.component';

@NgModule({
  declarations: [MySharedLibraryComponent],
  imports: [],
  exports: [MySharedLibraryComponent],
})
export class MySharedLibraryModule {}
