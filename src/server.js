import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import mongoose from 'mongoose';
import * as Rooms from './controllers/room_controller';

// initialize
const app = express();
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/kahootApi';
mongoose.connect(mongoURI).then(() => {
  console.log('connected to db:', mongoURI);
}).catch((err) => {
  console.log('could not connect to db:', mongoURI);
});

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable/disable http request logging
app.use(morgan('dev'));

// enable only if you want templating
app.set('view engine', 'ejs');

// enable only if you want static assets from folder static
app.use(express.static('static'));

// this just allows us to render ejs from the ../app/views directory
app.set('views', path.join(__dirname, '../src/views'));

// enable json message body for posting data to API
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads

// additional init stuff should go before hitting the routing

// default index route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the kahoot api!' });
});

app.get('/rooms', async (req, res) => {
  try {
    const rooms = await Rooms.getAllRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json(`${err}`);
  }
});

app.get('/room/:id', async (req, res) => {
  const roomID = req.params.id;
  try {
    const roomInfo = await Rooms.getRoomInfo(roomID);
    res.json(roomInfo);
  } catch (err) {
    res.status(404).send(`ERROR: ${err}`);
  }
});

app.get('/scoreboard/:id', async (req, res) => {
  const roomID = req.params.id;
  try {
    const scoreboard = await Rooms.getScoreboard(roomID);
    res.json(scoreboard);
  } catch {
    res.status(404).json({ message: 'Room not found' });
  }
});

app.post('/submission/:id', async (req, res) => {
  const roomID = req.params.id;
  const { user } = req.body;
  const { responses } = req.body;

  try {
    await Rooms.submit(roomID, user, responses);
    res.json({ message: 'Submitted successfully' });
  } catch (err) {
    res.status(500).json(`${err}`);
  }
});

app.post('/room', async (req, res) => {
  const roomInitInfo = req.body;

  try {
    const result = await Rooms.createRoom(roomInitInfo);
    res.json(`Created room with id: ${result.id}`);
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.delete('/room/:id', async (req, res) => {
  const roomID = req.params.id;
  try {
    await Rooms.deleteRoom(roomID);
    res.json({ message: `Room ${roomID} deleted successfully` });
  } catch (err) {
    res.status(500).json({ err });
  }
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
