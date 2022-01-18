export class AppPage {
  navigateTo() {
    return cy.visit('/');
  }

  getTitle() {
    return cy.get('app-root h1');
  }

  getDiv() {
    return cy.get('body>div');
  }

  getParagraph() {
    return cy.get('body>p');
  }

  getVersion() {
    return cy.get('body .version');
  }
}
