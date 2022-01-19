import { version } from '@project';
import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display paragraph coming from transform function', () => {
    page.navigateTo();
    page.getParagraph().should('have.text', 'Configuration: production');
  });

  it('should display version in div with `version` css class', () => {
    page.navigateTo();
    page.getVersion().should('have.text', version);
  });
});
