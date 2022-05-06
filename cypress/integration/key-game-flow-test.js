/* eslint-disable no-undef */
// globals
let roomId;
let roomKey;

describe('creating a game', () => {
  it('admin creates room', () => {
    cy.request(
      'POST',
      '/rooms',
      {
        creator: 'ZSG',
        roomKey: 'testkey',
        questions: [
          { prompt: 'Who is the most legendary prof at Dartmouth?', answer: 'Tim Tregubov' },
          { prompt: 'What is the best programming language?', answer: 'JavaScript' },
        ],
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      roomId = response.body._id;
      roomKey = response.body.roomKey;
    });
  });
});

describe('opening the room', () => {
  it('admin opens room', () => {
    cy.request(
      'PATCH',
      `/rooms/${roomId}?roomKey=${roomKey}`,
      {
        roomKey,
        status: 'open',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe('players joining', () => {
  it('Alice joins', () => {
    cy.request('POST', `/rooms/${roomId}`,
      {
        name: 'Alice',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
  it('Bob joins', () => {
    cy.request('POST', `/rooms/${roomId}`,
      {
        name: 'Bob',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

// admin starts game
describe('starting game', () => {
  it('admin starts game', () => {
    cy.request(
      'PATCH',
      `/rooms/${roomId}?roomKey=${roomKey}`,
      {
        roomKey,
        status: 'in progress',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

// Alice submits
describe('Players submit answers to first question', () => {
  it('Alice submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Alice',
        response: 'Tim Tregubov',
      }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it('Bob submits (incorrect)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Bob',
        response: 'Mr. Dr. Professor',
      }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

// Players checks the score after the first question
describe('Players check their scores after first Q', () => {
  it('Alice checks the score', () => {
    cy.request('GET', `/rooms/${roomId}?player=Alice`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(1);
    });
  });

  it('Bob checks the score', () => {
    cy.request('GET', `/rooms/${roomId}?player=Bob`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(2);
    });
  });
});

describe('Players submit answers to second question', () => {
  it('Alice submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Alice',
        response: 'JavaScript',
      }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it('Bob submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Bob',
        response: 'JavaScript',
      }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe('Players check their final scores', () => {
  it('Alice checks the score', () => {
    cy.request('GET', `/rooms/${roomId}?player=Alice`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(1);
    });
  });

  it('Bob checks the score', () => {
    cy.request('GET', `/rooms/${roomId}?player=Bob`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(2);
    });
  });
});
