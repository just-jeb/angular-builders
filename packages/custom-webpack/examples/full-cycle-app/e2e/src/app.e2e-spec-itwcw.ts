import { AppPage } from './app.po';

describe('workspace-project App ITWCW', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display paragraph coming from transform function', async () => {
    await page.navigateTo();
    expect(await page.getParagraphText()).toEqual('Configuration: itwcw');
  });
});
