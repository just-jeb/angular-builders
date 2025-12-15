import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have matchMedia global mock defined by default`, () => {
    expect(window.matchMedia).toBeTruthy();
  });

  it('should render title in a h1 tag', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to my-first-app!');
  });

  it('should update view automatically when signal changes (zoneless)', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;

    expect(compiled.querySelector('h1').textContent).toContain('my-first-app');

    fixture.componentInstance.title.set('updated-title');
    await fixture.whenStable();

    expect(compiled.querySelector('h1').textContent).toContain('updated-title');
  });
});
