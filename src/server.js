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

app.get('/room/:id', (req, res) => {
  const roomID = req.params.id;
  Rooms.getRoomInfo(roomID).then((roomInfo) => {
    res.json(roomInfo);
  }).catch((err) => {
    res.status(404).send(`ERROR: ${err}`);
  });
});

app.get('/scoreboard/:id', (req, res) => {
  const roomID = req.params.id;
  Rooms.getScoreboard(roomID).then((scoreboard) => {
    res.json(scoreboard);
  }).catch((err) => {
    res.status(404).json({ message: 'Room not found' });
  });
});

app.post('/submit/:id', (req, res) => {
  const roomID = req.params.id;
  const user = req.body.user;
  const responses = req.body.responses;
  Rooms.submit(roomID, user, responses).then(() => {
    res.json({message: 'Submitted successfully'});
  }).catch((err) => {
    res.status(500).json(`${err}`);
  });
});

app.post('/create', (req, res) => {
  const roomInitInfo = req.body;
  Rooms.createRoom(roomInitInfo).then((result) => {
    res.send(result);
  }).catch((err) => {
    res.status(500).json({ err });
  });
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
