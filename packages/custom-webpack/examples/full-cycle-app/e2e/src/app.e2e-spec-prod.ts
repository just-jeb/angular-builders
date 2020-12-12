import { version } from '@project';
import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display paragraph coming from transform function', async () => {
    await page.navigateTo();
    expect(await page.getParagraphText()).toEqual('Configuration: production');
  });

  it('should display version in div with `version` css class', async () => {
    await page.navigateTo();
    expect(await page.getVersionText()).toContain(version);
  });
});
