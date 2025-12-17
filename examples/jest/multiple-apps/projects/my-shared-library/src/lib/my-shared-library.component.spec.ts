import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySharedLibraryComponent } from './my-shared-library.component';

describe('MySharedLibraryComponent', () => {
  let component: MySharedLibraryComponent;
  let fixture: ComponentFixture<MySharedLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySharedLibraryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MySharedLibraryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
