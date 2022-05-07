import Room from '../models/room_model';
import Submission from '../models/submission_model';

export const gameStates = {
  in_progress: 'in_progress',
  closed: 'closed',
  game_over: 'game_over',
  open: 'open',
};

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.submissions = [];
  newRoom.status = 'closed';
  newRoom.currentQuestion = 0;
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
};

// todo: needs to be global admin protected
// or for testing only - remove later
export const getAllRooms = async () => {
  const rooms = await Room.find({});
  return rooms;
};

export const joinRoom = async (roomId, playerInfo) => {
  const room = await Room.findById(roomId);

  // make sure player's intended name does not already exist
  const newPlayerName = playerInfo.name;
  const existingPlayers = room.players;

  if (existingPlayers.find((player) => { return player === newPlayerName; })) {
    throw new Error(`Player with your intended name (${newPlayerName}) already exists`);
  }

  console.log(room.status);
  if (room.status === gameStates.closed) {
    throw new Error('This room is closed');
  } else if (room.status === gameStates.in_progress) {
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

  if (status in gameStates) {
    room.status = status;
  } else {
    throw new Error(`Invalid status. Must be ${gameStates.closed}, ${gameStates.open}, ${gameStates.in_progress} or ${gameStates.game_over}`);
  }

  return room.save();
};

export const deleteRoom = (roomId) => {
  // what might a reset room look like?
  return Room.findByIdAndDelete(roomId);
};

const getScoreboard = async (roomId, requestingPlayer) => {
  const room = await Room.findById(roomId);
  const roomSubmissions = await Submission.find({ roomId });

  const scoreboard = {};
  room.players.forEach((player) => {
    scoreboard[player] = 0;
  });

  // don't count unfinished rounds
  roomSubmissions.forEach((submission) => {
    if ((room.currentQuestion === 'game_over' || submission.questionNumber < room.currentQuestion) && submission.correct) {
      scoreboard[submission.player] += 1;
    }
  });

  const sortedScoreboard = Object.entries(scoreboard).sort((a, b) => { return b[1] - a[1]; });

  const topThree = sortedScoreboard.slice(0, 3);

  const requestingPlayerScoreboardPosition = sortedScoreboard.findIndex((entry) => { return entry[0] === requestingPlayer; });
  return { topThree, requestingPlayerScoreboardPosition };
};

export const getState = async (roomId, player) => {
  const room = await Room.findById(roomId);
  const { topThree, requestingPlayerScoreboardPosition } = await getScoreboard(roomId, player);

  const gameOver = room.currentQuestion === room.questions.length;

  const state = {
    roomId,
    status: room.status,
    yourName: player,
    yourRank: requestingPlayerScoreboardPosition === -1 ? null : requestingPlayerScoreboardPosition + 1,
    top3: topThree,
    currentQuestionNumber: gameOver ? 'game_over' : room.currentQuestion + 1,
    currentQuestion: gameOver ? 'game_over' : room.questions[room.currentQuestion].prompt,
  };

  return state;
};
