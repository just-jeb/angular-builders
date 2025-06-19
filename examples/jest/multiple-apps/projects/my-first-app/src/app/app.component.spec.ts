import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have only two of the global mocks defined`, () => {
    expect(window.getComputedStyle).toBeTruthy();
    expect(document.body.style.transform).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(document.doctype as any).not.toEqual('<!DOCTYPE html>');
    expect(window.matchMedia).toBeFalsy();
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to my-first-app!');
  });
});
