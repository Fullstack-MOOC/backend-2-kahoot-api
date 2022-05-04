// globals
let roomId;
let roomKey;

describe('you shold be able to create a game', () => {
  it('creates a new game', () => {
    cy.request('POST', '/rooms',
      {
        creator: 'ZSG',
        roomKey: 'testkey',
        questions: [
          { prompt: 'Who is the most legendary prof at Dartmouth?', answer: 'Tim Tregubov' },
          { prompt: 'What is the best programming language?', answer: 'JavaScript' },
        ],
      }).then((response) => {
      expect(response.status).to.eq(200);
      roomId = response.body._id;
      roomKey = response.body.roomKey;
    });
  });
});

// test to make sure room was created correctly
describe('you should be able to get all info about a room', () => {
  it('should return the full room object when you hit the room endpoint with the correct key', () => {
    cy.request('GET', `/rooms/${roomId}?roomKey=${roomKey}`).then((response) => {
      // make sure request was successful
      expect(response.status).to.eq(200);
      // check properties of the room object to make sure it has everything
      expect(response.body.questions);
    });
  });
});

describe('a player should be able to get just the questions when the room has a key', () => {
  it('should return success code and questions, but not answers', () => {
    cy.request('GET', `/rooms/${roomId}`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.nested.property('questions[0].prompt').but.to.not.have.nested.property('questions[0].answer');
    });
  });
});

describe('a player should be able to submit answers to the questions', () => {
  it('should return success when you submit correctly formatted answers, even if you get one wrong', () => {
    cy.request('POST', `/rooms/${roomId}`,
      {
        player: 'Player 1',
        responses: [
          'Tim Tregubov',
          'Python',
        ],
      }).then((response) => {
      expect(response.status).to.eq(200);
      console.log(response.body);
    });
  });

  it('should return success when you submit correctly formatted answers, when you get all of them correct', () => {
    cy.request('POST', `/rooms/${roomId}`,
      {
        player: 'Player 2',
        responses: [
          'Tim Tregubov',
          'JavaScript',
          'Party in the USA',
        ],
      }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body);
    });
  });
});