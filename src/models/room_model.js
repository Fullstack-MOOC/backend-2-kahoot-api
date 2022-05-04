import mongoose, { Schema } from 'mongoose';

const SubmissionSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  player: {
    type: String,
    required: true,
  },
  responses: [String],
}, {
  timestamps: true,
});

// schema
const RoomSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  submissions: [SubmissionSchema],
  roomKey: String,
});

function generateScoreboard() {
  if (!(this.submissions)) {
    return [];
  }
  const scoreboard = this.submissions.map((submission) => {
    let numCorrect = 0;
    submission.responses.forEach((response, index) => {
      if (response === this.questions[index].answer) {
        numCorrect += 1;
      }
    });
    return { Player: `${submission.player}`, 'Correct Answers': `${numCorrect}` };
  });

  /**
  * sort the scoreboard by decreasing number of correct answers
  * this is most efficient way to do it according to
  * https://stackoverflow.com/questions/52030110/sorting-strings-in-descending-order-in-javascript-most-efficiently/52030179
  */
  scoreboard.sort().reverse();
  return scoreboard;
}

RoomSchema.virtual('scoreboard').get(generateScoreboard);

// class
const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
