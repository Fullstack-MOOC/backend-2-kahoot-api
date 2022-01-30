import Room from '../models/room_model';

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.answers = roomInitInfo.answers;
  newRoom.submissions = [];

  return newRoom.save();
};

export const deleteRoom = (roomID) => {
  return Room.findByIdAndDelete(roomID);
};

export const getRoomInfo = (roomID) => {
  return Room.findById(roomID);
};

export const getAllRooms = () => {
  return Room.find({});
};

export const getScoreboard = async (roomID) => {
  const room = await Room.findById(roomID);
  return room.scoreboard;
};

export const submit = async (roomID, user, responses) => {
  const room = await Room.findById(roomID);
  room.submissions.push({
    user,
    responses,
  });
  return room.save();
};
