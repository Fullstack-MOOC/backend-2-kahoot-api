import Room from '../models/room_model';

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.submissions = [];
  // if (roomInitInfo.roomKey) {
  //   newRoom.roomKey = roomInitInfo.roomKey;
  // }
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
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

export const getScoreboard = async (roomId) => {
  const room = await Room.findById(roomId);
  return room.scoreboard;
};

export const submit = async (roomId, player, responses) => {
  // Add a new submission to the submissions db
  // Could also use create() function that wraps new and save()
  const newSubmission = {};
  newSubmission.player = player;
  newSubmission.responses = responses;
  newSubmission.roomId = roomId;

  // Add the submission ref to the room's submissions array
  const room = await Room.findById(roomId);

  const rightAnswers = room.questions;
  let numCorrect = 0;

  if (responses.length !== rightAnswers.length) {
    throw new Error(`Number of responses (${responses.length}) does not match number of questions (${rightAnswers.length})`);
  }
  responses.forEach((response, index) => {
    if (response === rightAnswers[index].answer) {
      numCorrect += 1;
    }
  });

  room.submissions.push(newSubmission);
  await room.save();

  return numCorrect;
};
