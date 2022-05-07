/* eslint-disable no-undef */
// globals
let roomId;
let roomKey;

describe('Creating a game with questions and answers', () => {
  it('admin creates room', () => {
    cy.request(
      'POST',
      '/rooms',
      {
        creator: 'Cypress',
        roomKey: 'testkey',
        questions: [
          { prompt: 'What is the best class at Dartmouth?', answer: 'CS52' },
          { prompt: 'What is the best programming language?', answer: 'JavaScript' },
          { prompt: 'What is the answer to Life, the Universe, and Everything', answer: '42' },
        ],
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      roomId = response.body.id;
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
        status: 'OPEN',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe('Players join', () => {
  it('Alice joins the game', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}`,
      {
        name: 'Alice',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
  it('Bob joins the game', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}`,
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
        status: 'IN_PROGRESS',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

describe('Late players attempts to join', () => {
  it('George gets denied entry as game already started', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `/rooms/${roomId}`,
      body: {
        name: 'George',
      },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });
});

// Alice submits
describe('Players submit answers to first question (index 0)', () => {
  it('Bob submits (incorrect)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Bob',
        response: 'Not CS52',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.correct).to.eq(false);
      expect(response.body.questionNumber).to.eq(0);
    });
  });

  it('Bob tries to change his answer and fails', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `/rooms/${roomId}/submissions`,
      body: {
        player: 'Bob',
        response: 'CS52',
      },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('Alice submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Alice',
        response: 'CS52',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.correct).to.eq(true);
      expect(response.body.questionNumber).to.eq(0);
    });
  });
});

// Players checks the score after the first question
describe('Players check their scores after first round', () => {
  it('Alice checks the score, rank 1, and we are now on question 2 (index 1)', () => {
    cy.request('GET', `/rooms/${roomId}?player=Alice`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(1);
      expect(response.body.currentQuestionNumber).to.eq(1);
    });
  });

  it('Bob checks the score, rank 2, and we are now on question 2 (index 1)', () => {
    cy.request('GET', `/rooms/${roomId}?player=Bob`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(2);
      expect(response.body.currentQuestionNumber).to.eq(1);
    });
  });
});

describe('Players submit answers to 2nd question, (index 1)', () => {
  it('Alice submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Alice',
        response: 'JavaScript',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.correct).to.eq(true);
      expect(response.body.questionNumber).to.eq(1);
    });
  });

  it('Bob submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Bob',
        response: 'JavaScript',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.correct).to.eq(true);
      expect(response.body.questionNumber).to.eq(1);
    });
  });
});

describe('Players submit answers to 3rd question (index 2)', () => {
  it('Alice submits (correct)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Alice',
        response: '42',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.correct).to.eq(true);
      expect(response.body.questionNumber).to.eq(2);
    });
  });

  it('Bob submits (Incorrect)', () => {
    cy.request(
      'POST',
      `/rooms/${roomId}/submissions`,
      {
        player: 'Bob',
        response: 'Cheese',
      },
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.correct).to.eq(false);
      expect(response.body.questionNumber).to.eq(2);
    });
  });
});

describe('Players check their final scores (game over, question -1)', () => {
  it('Alice checks the score, rank 1', () => {
    cy.request('GET', `/rooms/${roomId}?player=Alice`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(1);
      expect(response.body.status).to.eq('GAME_OVER');
      expect(response.body.currentQuestionNumber).to.eq(-1);
    });
  });

  it('Bob checks the score, rank 2', () => {
    cy.request('GET', `/rooms/${roomId}?player=Bob`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.yourRank).to.eq(2);
      expect(response.body.status).to.eq('GAME_OVER');
      expect(response.body.currentQuestionNumber).to.eq(-1);
    });
  });
});

describe('Straggler tries to submit after game is over', () => {
  it('Bob is kicked out since game is over', () => {
    cy.request({
      failOnStatusCode: false,
      method: 'POST',
      url: `/rooms/${roomId}/submissions`,
      body: {
        player: 'Bob',
        response: 'Hack',
      },
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });
});
