import Room from '../models/room_model';
import Submission from '../models/submission_model';

const submit = async (roomId, player, response) => {
  const room = await Room.findById(roomId);

  if (room.status !== 'in_progress') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  if (!room.players.includes(player)) {
    throw new Error(`Player (${player}) not in room`);
  }

  const exisitingSubmission = await Submission.findOne({ roomId, player, questionNumber: room.currentQuestion });
  if (exisitingSubmission) {
    throw new Error('This player has already submitted a repsonse to this question');
  }

  const newSubmission = new Submission({
    roomId,
    player,
    response,
    questionNumber: room.currentQuestion,
    correct: room.questions[room.currentQuestion].answer === response,
  });

  await newSubmission.save();

  // see if all players have submitted
  const numPlayers = room.players.length;
  const numSubmissions = await Submission.countDocuments({ roomId, questionNumber: room.currentQuestion });

  // if question has been submitted by all players, move to next question
  if (numSubmissions === numPlayers) {
    room.currentQuestion += 1;
  }

  // close room if all questions have been answered
  if (room.currentQuestion === room.questions.length) {
    room.status = 'closed';
  }

  await room.save();

  return newSubmission;
};

export default submit;
