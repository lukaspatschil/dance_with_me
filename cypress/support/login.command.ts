declare namespace Cypress {
  interface Chainable<Subject> {
    login(): Chainable<Element>;
  }
}

function loginCommand() {
  cy.visit('/');
  cy.get('#nav-bar').click();
  cy.get('#nav-login').click();
  cy.get('#google').click();
  cy.visit('/');
}

Cypress.Commands.add('login', loginCommand);
