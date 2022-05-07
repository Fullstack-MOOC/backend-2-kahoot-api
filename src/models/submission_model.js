import mongoose, { Schema } from 'mongoose';

export const SubmissionSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  player: { type: String, required: true },
  response: { type: String, required: true },
  questionNumber: { type: Number, required: true },
  correct: { type: Boolean, required: true },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const SubmissionModel = mongoose.model('Submission', SubmissionSchema);

export default SubmissionModel;
