import mongoose, { Schema } from 'mongoose';

const RoomSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  players: [String],
  roomKey: String,
  status: String,
  currentQuestion: Number,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
