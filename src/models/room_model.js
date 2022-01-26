import mongoose, { Schema } from 'mongoose';

const SubmissionSchema = new Schema({
    user: {
        type: String,
        required: true,
    },
    responses: [String],
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
});

// schema
const RoomSchema = new Schema({
    creator: String,
    questions: [{prompt: String}],
    answers: [{solution: String}],
    submissions: [SubmissionSchema],
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
});

RoomSchema.virtual('scoreboard').get(function () {
    const scoreboard = [];
    const solutions = this.answers;
    this.submissions.forEach((submission) => {
        let numCorrect = 0;
        submission.responses.forEach((response, index) => {
            if (response == solutions[index].solution) {
                numCorrect++;
            }
        });
        scoreboard.push([`Player: ${submission.user}`, `${numCorrect} correct answer${numCorrect > 1 ? 's' : ''}`]);
    })
    
    return scoreboard;
});

// class
const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;