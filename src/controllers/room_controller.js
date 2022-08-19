import Room, { RoomStates } from '../models/room_model';
import { submit, getScores, countSubmissions } from './submission_controller';

export async function createRoom(roomInitInfo) {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.submissions = [];
  newRoom.status = RoomStates.CLOSED;
  newRoom.currentQuestionNumber = 0;
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
}

export async function joinRoom(roomId, playerInfo) {
  const room = await Room.findById(roomId);

  // make sure player's intended name does not already exist
  const newPlayerName = playerInfo.name;
  const existingPlayers = room.players;

  if (existingPlayers.includes(newPlayerName)) {
    throw new Error(`Player with your intended name (${newPlayerName}) already exists`);
  }

  if (room.status !== RoomStates.OPEN) {
    throw new Error(`This room is not open for joining in state ${room.status}`);
  }

  // username is free; add player to room
  room.players.push(newPlayerName);
  return room.save();
}

export async function changeStatus(roomId, roomKey, status) {
  const room = await Room.findById(roomId);
  if (room.roomKey !== roomKey) {
    throw new Error('Room key is incorrect');
  }

  if (status in RoomStates) {
    room.status = status;
  } else {
    throw new Error(`Invalid status. Must be ${RoomStates.CLOSED}, ${RoomStates.OPEN}, ${RoomStates.IN_PROGRESS} or ${RoomStates.GAME_OVER}`);
  }

  return room.save();
}

// returns the main game state with current question, rank, game status, and scoreboard
export async function getState(roomId, player) {
  const room = await Room.findById(roomId);
  const scores = await getScores(roomId, room.currentQuestionNumber, room.players);
  const topThree = scores.slice(0, 3);

  // get rank of requestingPlayer
  const requestingPlayerScoreboardPosition = scores.findIndex((entry) => { return entry[0] === player; });

  const gameOver = room.currentQuestionNumber === room.questions.length;

  const state = {
    roomId,
    status: room.status,
    players: room.players,
    yourName: player,
    yourRank: requestingPlayerScoreboardPosition === -1 ? null : requestingPlayerScoreboardPosition + 1,
    top3: topThree,
    currentQuestionNumber: gameOver ? -1 : room.currentQuestionNumber,
    currentQuestion: gameOver ? -1 : room.questions[room.currentQuestionNumber].prompt,
  };

  return state;
}

export async function forceAnswer(roomId, roomKey) {
  const room = await Room.findById(roomId);

  if (room.roomKey !== roomKey) {
    throw new Error('Room key is incorrect');
  }

  if (room.status !== 'IN_PROGRESS') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  room.players.forEach(async (player) => {
    try {
      await submitAnswer(roomId, player, '!timeout!');
    } catch (err) {
      if (err.message !== 'This player has already submitted a response to this question') {
        console.log('not overriding players submission');
        console.log(err);
      } else {
        throw err;
      }
    }
  });
}

// submit an answer to a room's current question
export async function submitAnswer(roomId, player, response) {
  const room = await Room.findById(roomId);

  if (room.status !== 'IN_PROGRESS') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  if (!room.players.includes(player)) {
    throw new Error(`Player (${player}) not in room`);
  }

  const isCorrect = room.questions[room.currentQuestionNumber].answer === response;

  const newSubmission = await submit(roomId, player, room.currentQuestionNumber, response, isCorrect);
  const numSubmissions = await countSubmissions(roomId, room.currentQuestionNumber);

  // if question has been submitted by all players, move to next question
  if (numSubmissions === room.players.length) {
    room.currentQuestionNumber += 1;
  }

  // close room if all questions have been answered
  if (room.currentQuestionNumber === room.questions.length) {
    room.status = RoomStates.GAME_OVER;
  }

  await room.save();

  return newSubmission;
}
