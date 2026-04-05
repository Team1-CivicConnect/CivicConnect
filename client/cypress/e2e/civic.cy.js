describe('CivicConnect Platform Sanity Check', () => {
  it('should successfully load the landing page', () => {
    cy.visit('/');
    cy.contains('CivicConnect'); // Header or Hero check
  });

  it('should navigate to login page successfully', () => {
    cy.visit('/');
    // Check looking for common navigation links
    cy.get('a[href="/login"]').last().click({ force: true });
    cy.url().should('include', '/login');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('should prevent empty form submission on login', () => {
    cy.visit('/login');
    // Ensure the sign in button exists and click it
    cy.contains('button', /Sign In|Login/i).click();
    // Because HTML5 validation stops submission, URL will not change
    cy.url().should('include', '/login');
  });
});
