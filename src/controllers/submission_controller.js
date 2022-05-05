import Room from '../models/room_model';
import Submission from '../models/submission_model';

const submit = async (roomId, player, response) => {
  const room = await Room.findById(roomId);

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

  room.numSubmissions += 1;

  if (room.numSubmissions === numPlayers) {
    room.currentQuestion += 1;
  }

  // close room if all questions have been answered
  if (room.currentQuestion === room.questions.length) {
    room.open = false;
  }

  await room.save();

  return newSubmission;
};

export default submit;
