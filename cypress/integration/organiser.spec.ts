// @ts-ignore
import event from '../fixtures/event.json';

describe('Organiser tests', () => {
  before(() => {
    cy.task('db:connect');
    cy.task('db:organiser');
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

    cy.contains('Organiser');
    cy.contains('Lukas Spatschil');
    cy.contains('dancewithmease@gmail.com');
    cy.contains('Profil löschen');
  });

  it('Creates a new event', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-create').click();

    cy.get('#event-name').type(event.data.name);
    cy.get('#date').type(event.data.date);
    cy.get('#startTime').type(event.data.startTime);
    cy.get('#endTime').type(event.data.endTime);
    cy.get('#street').type(event.data.street);
    cy.get('#housenumber').type(event.data.housenumber);
    cy.get('#zip').type(event.data.postalcode);
    cy.get('#city').type(event.data.city);
    cy.get('#country').type(event.data.country);
    cy.get('#price').type(event.data.price);
    cy.get('#description').type(event.data.description);
    cy.get('#category0').check();
    cy.get('#category2').check();
    cy.get('#image').attachFile(event.data.image);

    cy.get('#create_button').click();
    cy.contains('EIN FEHLER IST AUFGETRETEN, BITTE VERSUCHEN SIE ES ERNEUT.').should('not.exist');

    cy.get('#name').type(event.payment.name);
    cy.get('#street').type(event.payment.street);
    cy.get('#housenumber').type(event.payment.housenumber);
    cy.get('#zip').type(event.payment.postalcode);
    cy.get('#city').type(event.payment.city);
    cy.get('#country').type(event.payment.country);

    cy.getStripeElement('cardNumber').type(event.payment.cardnumber);
    cy.getStripeElement('cardExpiry').type(event.payment.expire);
    cy.getStripeElement('cardCvc').type(event.payment.cvc);
    cy.getStripeElement('postalCode').type(event.payment.zip);

    cy.get('#create_button').click();
    cy.url().should('contain', 'events');
  });

  it('Shows the created event in the list', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-events').click();

    cy.get('input[type=range]').invoke('val', 100).trigger('change');

    cy.contains(event.data.name);
    cy.contains(event.data.street);
    cy.contains(event.data.housenumber);
    cy.contains(event.data.postalcode);
    cy.contains(event.data.city);
    cy.contains(event.data.startTime);
  });

  it('Updates the created event', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-events').click();

    cy.get('input[type=range]').invoke('val', 100).trigger('change');
    cy.contains(event.data.name).click();

    cy.contains('edit').click();

    cy.get('#event-name').clear().type(event.edit.name);
    cy.get('#create_button').click();
    cy.contains('EIN FEHLER IST AUFGETRETEN, BITTE VERSUCHEN SIE ES ERNEUT.').should('not.exist');

    cy.url().should('contain', 'event');
    cy.contains(event.edit.name);
  });

  it('Attends the created event', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-events').click();

    cy.get('input[type=range]').invoke('val', 100).trigger('change');
    cy.contains(event.edit.name).click();

    cy.contains('calendar_add_on').click();
    cy.contains('calendar_add_on').should('not.exist');
    cy.contains('event_available');
  });

  it('Deletes the created event', () => {
    cy.login();
    cy.get('#nav-bar').click();
    cy.get('#nav-events').click();

    cy.get('input[type=range]').invoke('val', 100).trigger('change');
    cy.contains(event.edit.name).click();

    cy.contains('Event löschen').click();

    cy.contains(event.edit.name).should('not.exist');
  });
});
