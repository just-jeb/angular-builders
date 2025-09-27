import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let appElem: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    appElem = fixture.debugElement.nativeElement;
  });

  it('should create the app', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'sanity-esbuild-app'`, () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('sanity-esbuild-app (compilation provided)');
  });

  it('should render title in a h1 tag', () => {
    expect(appElem.querySelector('h1')!.textContent).toContain(
      'sanity-esbuild-app (compilation provided)'
    );
  });

  it('should render subtitle in a h2 tag', () => {
    expect(appElem.querySelector('h2')!.textContent).toContain(
      'sanity-esbuild-app subtitle (compilation provided)'
    );
  });

  it('should render titleByOption in a h3 tag', () => {
    expect(appElem.querySelector('h3')!.textContent).toContain(
      'sanity-esbuild-app optionTitle (compilation provided)'
    );
  });
});
