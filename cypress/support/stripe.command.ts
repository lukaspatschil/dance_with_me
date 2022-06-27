declare namespace Cypress {
  interface Chainable<Subject> {
    getStripeElement(fieldName: string): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add('getStripeElement', (fieldName) => {
  if (Cypress.config('chromeWebSecurity')) {
    throw new Error('To get stripe element `chromeWebSecurity` must be disabled');
  }

  const selector = `input[data-elements-stable-field-name="${fieldName}"]`;

  return cy
    .get('iframe')
    .its('0.contentDocument.body').should('not.be.empty')
    .then(cy.wrap)
    .find(selector);
});
