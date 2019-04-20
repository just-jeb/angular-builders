import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display generated Hello World div', async () => {
    await page.navigateTo();
    expect(await page.getDivText()).toEqual('Hello world');
  });
});
