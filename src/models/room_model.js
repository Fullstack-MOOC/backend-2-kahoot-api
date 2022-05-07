import mongoose, { Schema } from 'mongoose';

export const RoomStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  GAME_OVER: 'GAME_OVER',
  OPEN: 'OPEN',
};

const RoomSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  players: [String],
  roomKey: String,
  status: { type: String, enum: RoomStates, default: RoomStates.CLOSED },
  currentQuestionNumber: Number,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
