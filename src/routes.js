import { Router } from 'express';
import * as Rooms from './controllers/room_controller';
import submit from './controllers/submission_controller';

const router = Router();

// default index route
router.get('/', (req, res) => {
  return res.json({ message: 'Welcome to the kahoot API!' });
});

router.route('/rooms')
  .get(async (req, res) => {
    try {
      const rooms = await Rooms.getAllRooms();
      return res.json(rooms);
    } catch (err) {
      return res.status(500).json(`${err}`);
    }
  })
  .post(async (req, res) => {
    const roomInitInfo = req.body;

    try {
      const result = await Rooms.createRoom(roomInitInfo);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ err });
    }
  });

router.route('/rooms/:id')
  .get(async (req, res) => {
    const roomId = req.params.id;
    const { player } = req.query;
    // const { roomKey } = req.query;

    try {
      const state = await Rooms.getState(roomId, player);
      return res.json(state);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  })
  .post(async (req, res) => {
    const roomId = req.params.id;
    const playerInfo = req.body;
    try {
      await Rooms.joinRoom(roomId, playerInfo);
      return res.json({ message: 'You\'re in. Congrats!' });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.toString());
    }
  })
  .patch(async (req, res) => {
    const roomId = req.params.id;
    const { roomKey } = req.query;
    const newStatus = req.body.status;

    try {
      const result = await Rooms.changeStatus(roomId, roomKey, newStatus);
      return res.json(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err });
    }
  });

router.post('/rooms/:id/submissions', async (req, res) => {
  const roomId = req.params.id;
  const { player, response } = req.body;

  try {
    const submissionData = await submit(roomId, player, response);
    return res.json(submissionData);
  } catch (err) {
    console.log(err);
    return res.status(500).json(`${err}`);
  }
});

router.get('/rooms/:id/scoreboard', async (req, res) => {
  const roomId = req.params.id;
  try {
    const scoreboard = await Rooms.getScoreboard(roomId);
    return res.json(scoreboard);
  } catch (err) {
    return res.status(404).json(`${err}`);
  }
});

export default router;
