describe('User tests', () => {
  before(() => {
    cy.task('db:connect');
    cy.task('db:user');
  });

  after(() => {
    cy.task('db:disconnect');
  });

  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.contains('dance with me');
  });

  it('Switches the language of the application', () => {
    cy.visit('/');
    cy.contains('de');
    cy.get('#nav-bar').click();
    cy.contains('Anmelden');

    cy.get('#nav-language').click();

    cy.contains('en');
    cy.get('#nav-bar').click();
    cy.contains('Login');
  });

  it('Logs into the application', () => {
    cy.login();
    cy.get('#nav-bar').click();

    cy.contains('Veranstaltungen');
    cy.contains('Profil');
  });

  it('Opens the user details', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-user').click();

    cy.contains('User');
    cy.contains('Lukas Spatschil');
    cy.contains('dancewithmease@gmail.com');
    cy.contains('Profil löschen');
  });

  it('Logs the user out', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-logout').click();

    cy.get('#nav-bar').click();
    cy.contains('Anmelden');
  });
});
