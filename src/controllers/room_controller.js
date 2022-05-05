import Room from '../models/room_model';
import Submission from '../models/submission_model';

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.submissions = [];
  newRoom.open = false;
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
};

export const joinRoom = async (roomId, playerInfo) => {
  const room = await Room.findById(roomId);

  // make sure player's intended name does not already exist
  const newPlayerName = playerInfo.name;
  const existingPlayers = room.players;

  if (existingPlayers.find((player) => { return player === newPlayerName; })) {
    throw new Error(`Player with your intended name (${newPlayerName})) already exists`);
  }

  // username is free; add player to room
  room.players.push(newPlayerName);

  return room.save();
};

export const changeStatus = async (roomId, roomKey, newStatus) => {
  const room = await Room.findById(roomId);
  if (room.roomKey !== roomKey) {
    throw new Error('Room key is incorrect');
  }

  if (newStatus === 'open') {
    room.open = true;
  } else if (newStatus === 'closed') {
    room.open = false;
  } else {
    throw new Error('Invalid status. Must be "open" or "closed"');
  }

  return room.save();
};

export const deleteRoom = (roomId) => {
  return Room.findByIdAndDelete(roomId);
};

// for players checking the status of the game
export const getLimitedRoomInfo = async (roomId) => {
  return Room.findById(roomId, {
    'questions.answer': 0, scoreboard: 0, submissions: 0, roomKey: 0,
  });
};

// for room creators checking the status of the game or room properties
export const getAllRoomInfo = async (roomId, roomKey) => {
  const room = await Room.findById(roomId);
  if (roomKey === room.roomKey) {
    return room;
  } else {
    throw new Error(`Room key ${roomKey} does not match key for this room.`);
  }
};

export const getScoreboard = async (roomId, requestingPlayer) => {
  const room = await Room.findById(roomId);
  const roomSubmissions = await Submission.find({ roomId });

  const scoreboard = {};
  room.players.forEach((player) => {
    scoreboard[player] = 0;
  });

  roomSubmissions.forEach((submission) => {
    if (submission.questionNumber < room.currentQuestion && submission.correct) {
      scoreboard[submission.player] += 1;
    }
  });

  const sortedScoreboard = Object.entries(scoreboard).sort((a, b) => { return b[1] - a[1]; });

  const topThree = sortedScoreboard.slice(2);
  const requestingPlayerScoreboardPosition = sortedScoreboard.findIndex((entry) => { return entry[0] === requestingPlayer; });

  return { topThree, requestingPlayerScoreboardPosition };
};
