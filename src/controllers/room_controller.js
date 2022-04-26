import Room from '../models/room_model';

export const createRoom = (roomInitInfo) => {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.questions = roomInitInfo.questions;
  newRoom.submissions = [];

  console.log(newRoom);

  return newRoom.save();
};

export const deleteRoom = (roomID) => {
  return Room.findByIdAndDelete(roomID);
};

export const getLimitedRoomInfo = async (roomID) => {
  return Room.findById(roomID, { 'questions.answer': 0, scoreboard: 0, submissions: 0 });
};

export const getScoreboard = async (roomID) => {
  const room = await Room.findById(roomID);
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
  responses.forEach((response, index) => {
    console.log(`index ${index}`);
    if (response === rightAnswers[index].answer) {
      numCorrect += 1;
    }
  });

  console.log(numCorrect);

  room.submissions.push(newSubmission);

  return room.save();
};

// export const getAllRooms = () => {
//   return Room.find({});
// };
