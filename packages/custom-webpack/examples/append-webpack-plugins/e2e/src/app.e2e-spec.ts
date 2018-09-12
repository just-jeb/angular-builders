import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display generated Hello World div', () => {
    page.navigateTo();
    expect(page.getDivText()).toEqual('Hello world');
  });
});
