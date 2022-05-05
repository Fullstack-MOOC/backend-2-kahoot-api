import mongoose, { Schema } from 'mongoose';

export const SubmissionSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  player: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  questionNumber: {
    type: Number,
    required: true,
  },
  correct: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true,
});

// class
export const SubmissionModel = mongoose.model('Submission', SubmissionSchema);
