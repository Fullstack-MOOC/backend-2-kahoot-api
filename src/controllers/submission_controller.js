import Submission from '../models/submission_model';

// new answer submission
export async function submit(roomId, player, questionNumber, response, correct) {
  const exisitingSubmission = await Submission.findOne({ roomId, player, questionNumber });
  if (exisitingSubmission) {
    throw new Error('This player has already submitted a repsonse to this question');
  }

  const newSubmission = new Submission({
    roomId,
    player,
    response,
    questionNumber,
    correct,
  });
  await newSubmission.save();

  // see if all players have submitted and update the game state as necessary / has to be after submission is saved
  const numSubmissions = await Submission.countDocuments({ roomId, questionNumber });

  return { numSubmissions, newSubmission };
}

// computes scores for all players in a room
export async function getScores(roomId, currentQuestionNumber, players) {
  const submissions = await Submission.find({ roomId, questionNumber: currentQuestionNumber });

  const scores = {};
  players.forEach((player) => {
    scores[player] = 0;
  });

  submissions.forEach((submission) => {
    // don't count unfinished rounds
    if (submission.questionNumber < currentQuestionNumber && submission.correct) {
      scores[submission.player] += 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => { return b[1] - a[1]; });

  return sorted;
}
