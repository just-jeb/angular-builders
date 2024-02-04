import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    page.getTitle().should('have.text', 'sanity-esbuild-app (compilation provided)');
    page.getSubtitle().should('have.text', 'sanity-esbuild-app subtitle (compilation provided)');
  });

  it('should display text from custom middleware', () => {
    cy.visit('/send-hello').get('h1').should('have.text', 'Hello text from middleware!');
  });
});
