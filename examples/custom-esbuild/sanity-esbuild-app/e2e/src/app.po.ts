export class AppPage {
  navigateTo() {
    return cy.visit('/');
  }

  getTitle() {
    return cy.get('app-root h1');
  }

  getSubtitle() {
    return cy.get('app-root h2');
  }
}
