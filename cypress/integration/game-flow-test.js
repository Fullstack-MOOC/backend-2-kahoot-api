describe('you shold be able to create a game', () => {
  it('should return success status code when you hit the create endpoint with valid data', () => {
    cy.request('/room/create').as('createRoomRequest');
    cy.get('@createRoomRequest').then((response) => {
      expect(response.status).to.eq(200);
      // probably should asset something about the response here as well
    });
  });
});
