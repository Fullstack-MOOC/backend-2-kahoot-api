import { Router } from 'express';
import * as Rooms from './controllers/room_controller';

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
    const { roomKey } = req.query;
    if (roomKey) {
      // key included and right, return everything
      // key included and wrong, return error
      try {
        const room = await Rooms.getAllRoomInfo(roomId, roomKey);
        return res.json(room);
      } catch (err) {
        console.log(err);
        return res.status(500).json({ err });
      }
    } else {
      try {
        const roomInfo = await Rooms.getLimitedRoomInfo(roomId);
        return res.json(roomInfo);
      } catch (err) {
        console.log(err);
        return res.status(500).json({ err });
      }
    }
  })
  .post(async (req, res) => {
    const roomId = req.params.id;
    const { player, responses } = req.body;

    try {
      const numCorrect = await Rooms.submit(roomId, player, responses);
      return res.json({ correct: numCorrect });
    } catch (err) {
      console.log(err);
      return res.status(500).json(`${err}`);
    }
  })
  .delete(async (req, res) => {
    const roomId = req.params.id;
    try {
      await Rooms.deleteRoom(roomId);
      return res.json({ message: `Room ${roomId} deleted successfully` });
    } catch (err) {
      return res.status(500).json({ err });
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
