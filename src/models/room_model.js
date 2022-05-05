import mongoose, { Schema } from 'mongoose';

// schema
const RoomSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  players: [String],
  roomKey: String,
  open: Boolean,
  currentQuestion: Number,
  newSubmissions: Number,
});

// class
const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
