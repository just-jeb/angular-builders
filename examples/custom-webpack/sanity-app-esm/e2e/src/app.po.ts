export class AppPage {
  navigateTo() {
    return cy.visit('/');
  }

  getTitle() {
    return cy.get('#app-title');
  }
}
