import { getState, checkQuestion, updateRoom } from './room_controller';
import Submission from '../models/submission_model';

const submit = async (roomId, player, response) => {
  const roomState = await getState(roomId, player);

  if (roomState.status !== 'IN_PROGRESS') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  if (!roomState.players.includes(player)) {
    throw new Error(`Player (${player}) not in room`);
  }

  const exisitingSubmission = await Submission.findOne({ roomId, player, questionNumber: roomState.currentQuestionNumber });
  if (exisitingSubmission) {
    throw new Error('This player has already submitted a repsonse to this question');
  }

  const isCorrect = await checkQuestion(roomId, roomState.currentQuestionNumber, response);

  const newSubmission = new Submission({
    roomId,
    player,
    response,
    questionNumber: roomState.currentQuestionNumber,
    correct: isCorrect,
  });
  await newSubmission.save();

  // see if all players have submitted and update the game state as necessary / has to be after submission is saved
  const numSubmissions = await Submission.countDocuments({ roomId, questionNumber: roomState.currentQuestionNumber });
  await updateRoom(roomState.roomId, numSubmissions);

  return newSubmission;
};

export default submit;
