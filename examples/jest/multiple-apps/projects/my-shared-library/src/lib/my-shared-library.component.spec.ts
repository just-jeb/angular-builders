import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MySharedLibraryComponent } from './my-shared-library.component';

describe('MySharedLibraryComponent', () => {
  let component: MySharedLibraryComponent;
  let fixture: ComponentFixture<MySharedLibraryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MySharedLibraryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MySharedLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
