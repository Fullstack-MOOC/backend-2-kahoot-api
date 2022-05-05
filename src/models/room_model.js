import mongoose, { Schema } from 'mongoose';

// schema
const RoomSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  players: [String],
  roomKey: String,
  status: String,
  currentQuestion: Number,
  numSubmissions: Number,
});

// class
const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
