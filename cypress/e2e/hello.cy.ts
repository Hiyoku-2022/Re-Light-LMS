describe('Hello Component', () => {
  it('renders hello world', () => {
    cy.visit('/');
    cy.contains('Hello, world!').should('be.visible');
  });
});
