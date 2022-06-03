describe('Upload test', () => {
  it('Connect and generate an Organiser', () => {
    cy.task('db:connect');
    cy.task('db:organiser');
  });
});
