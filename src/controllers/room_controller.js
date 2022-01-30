import Room from '../models/room_model';

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.answers = roomInitInfo.answers;
  newRoom.submissions = [];

  return newRoom.save();
};

export const getRoomInfo = (roomID) => {
  return Room.findById(roomID);
};

export const getScoreboard = (roomID) => {
  return Room.findById(roomID).then((room) => {
    return room.scoreboard;
  });
};

export const submit = (roomID, user, responses) => {
  return Room.findById(roomID).then((room) => {
    room.submissions.push({
      user,
      responses,
    });

    return room.save();
  }).catch((err) => {
    throw new Error('issue submitting responses');
  });
};
