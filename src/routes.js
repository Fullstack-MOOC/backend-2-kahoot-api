import { Router } from 'express';
import * as Rooms from './controllers/room_controller';

const router = Router();
// here we set up handling of endpoints
// each route will talk to a controller and return a response

// default index route
router.get('/', (req, res) => {
  return res.json({ message: 'Welcome to the kahoot API!' });
});

// get all rooms
router.get('/rooms', async (_, res) => {
  try {
    const rooms = await Rooms.getAllRooms();
    return res.json(rooms);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

// create a room - admin
router.post('/rooms', async (req, res) => {
  const roomInitInfo = req.body;

  try {
    const result = await Rooms.createRoom(roomInitInfo);
    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

// get gamestate for room
router.get('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const { player } = req.query;

  try {
    const state = await Rooms.getState(roomId, player);
    return res.json(state);
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});

// join a room
router.post('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const playerInfo = req.body;
  try {
    await Rooms.joinRoom(roomId, playerInfo);
    return res.json({ roomId, yourName: playerInfo.name });
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});

// change room status - admin
router.patch('/rooms/:id', async (req, res) => {
  const roomId = req.params.id;
  const { roomKey } = req.query;
  const { status } = req.body;

  try {
    const result = await Rooms.changeStatus(roomId, roomKey, status);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});

// submit a response
router.post('/rooms/:id/submissions', async (req, res) => {
  const roomId = req.params.id;
  const { player, response } = req.body;

  try {
    const submissionData = await Rooms.submitAnswer(roomId, player, response);
    return res.json(submissionData);
  } catch (error) {
    console.error(error);
    return res.status(422).json({ error: error.message });
  }
});

router.get('/rooms/:id/scoreboard', async (req, res) => {
  const roomId = req.params.id;
  try {
    const scoreboard = await Rooms.getScoreboard(roomId);
    return res.json(scoreboard);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});

export default router;
