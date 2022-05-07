import Room from '../models/room_model';
import Submission from '../models/submission_model';

export const RoomStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  GAME_OVER: 'GAME_OVER',
  OPEN: 'OPEN',
};

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.submissions = [];
  newRoom.status = RoomStates.CLOSED;
  newRoom.currentQuestionNumber = 0;
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
};

export const joinRoom = async (roomId, playerInfo) => {
  const room = await Room.findById(roomId);

  // make sure player's intended name does not already exist
  const newPlayerName = playerInfo.name;
  const existingPlayers = room.players;

  if (existingPlayers.includes(newPlayerName)) {
    throw new Error(`Player with your intended name (${newPlayerName}) already exists`);
  }

  if (room.status === RoomStates.CLOSED) {
    throw new Error('This room is closed');
  } else if (room.status === RoomStates.IN_PROGRESS) {
    throw new Error('This game is in progress. Cannot join now.');
  }

  // username is free; add player to room
  room.players.push(newPlayerName);

  return room.save();
};

export const changeStatus = async (roomId, roomKey, status) => {
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
};

// private method not in assignment spec
export const deleteRoom = (roomId) => {
  return Room.findByIdAndDelete(roomId);
};

// computes top3 scoreboard and player rank, we don't return the full list
const getScoreboard = async (room, requestingPlayer) => {
  const roomSubmissions = await Submission.find({ roomId: room.id });

  const scoreboard = {};
  room.players.forEach((player) => {
    scoreboard[player] = 0;
  });

  roomSubmissions.forEach((submission) => {
    // don't count unfinished rounds
    if (submission.questionNumber < room.currentQuestionNumber && submission.correct) {
      scoreboard[submission.player] += 1;
    }
  });

  const sortedScoreboard = Object.entries(scoreboard).sort((a, b) => { return b[1] - a[1]; });

  const topThree = sortedScoreboard.slice(0, 3);

  // get rank of requestingPlayer
  const requestingPlayerScoreboardPosition = sortedScoreboard.findIndex((entry) => { return entry[0] === requestingPlayer; });
  return { topThree, requestingPlayerScoreboardPosition };
};

// returns the main game state with current question, rank, game status, and scoreboard
export const getState = async (roomId, player) => {
  const room = await Room.findById(roomId);
  const { topThree, requestingPlayerScoreboardPosition } = await getScoreboard(room, player);

  const gameOver = room.currentQuestionNumber === room.questions.length;

  const state = {
    roomId,
    status: room.status,
    players: room.players,
    yourName: player,
    yourRank: requestingPlayerScoreboardPosition === -1 ? null : requestingPlayerScoreboardPosition + 1,
    top3: topThree,
    currentQuestionNumber: gameOver ? -1 : room.currentQuestionNumber, // why was this +1
    currentQuestion: gameOver ? -1 : room.questions[room.currentQuestionNumber].prompt,
  };

  return state;
};

export const updateRoom = async (roomId, numSubmissions) => {
  const room = await Room.findById(roomId);

  // if question has been submitted by all players, move to next question
  if (numSubmissions === room.players.length) {
    room.currentQuestionNumber += 1;
  }

  // close room if all questions have been answered
  if (room.currentQuestionNumber === room.questions.length) {
    room.status = RoomStates.GAME_OVER;
  }

  await room.save();
};

export const checkQuestion = async (roomId, question, submission) => {
  const room = await Room.findById(roomId);
  return room.questions[question].answer === submission;
};
