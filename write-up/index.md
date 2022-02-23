---
layout: page
title: Backend 2 - Kahoot API
published: false
comment_term: placeholder
---
<!-- ![](img/enm.jpg){: .small } -->

## Overview


In this assignment, we will be building on the skills you learned in the [first backend assignment](https://cs52.me/assignments/sa/server-side/#some-setup) to build a replica of the API for the quiz website Kahoot. The assignment will help you practice more complex database and API design techniques and help you learn how to test a backend without using a frontend.

<!-- <video loop autoplay mute controls>
  <source src="http://res.cloudinary.com/dali-lab/video/upload/ac_none,w_804,h_383/v1546203223/cs52/cs52_polling_SA.webm" type="video/webm"/>
  <source src="http://res.cloudinary.com/dali-lab/video/upload/ac_none,w_804,h_383/v1546203223/cs52/cs52_polling_SA.mp4" type="video/mp4"/>
  <source src="http://res.cloudinary.com/dali-lab/video/upload/ac_none,w_804,h_383/v1546203223/cs52/cs52_polling_SA.ogv" type="video/ogg"/>
  Your browser does not support HTML5 video tags
</video> -->

## Setup

### Database (Mongo)

Make sure you have followed the setup from the [backend assignment 1](https://cs52.me/assignments/sa/server-side/#some-setup) to install mongodb.

On OSX something like this should work:

```bash
brew uninstall --force mongodb
brew tap mongodb/brew
brew install mongodb-community
```

### Pull Starter

Now, go ahead and pull the backend starterpack that contains the pacakges and boilerplate needed for a express and mongo backend.

We're going to be building an API, where users can make requests to create or respond to quizzes. We will be using [backend assignment 1](https://github.com/dartmouth-cs52/express-babel-starter) to start, which sets us up with an `express` node server with a tiny bit of boilerplate as well as linting and babel. You could easily recreate this, but for now we'll save you some time by providing it for you.

🚀 This is similar to cloning a repo with `git clone`, but with a key difference. Instead of cloning from one remote location, we will add a new "remote" (basically a reference to a repo hosted on Github) so that we can pull code from there but also retain the reference to our repo for this project. That way, we don't modify the starterpack when we want to push our changes to Github.

```bash
# make sure you are in your project directory
git remote add starter STARTER_REPO_URL
git pull starter main
```

Then run these following commands in your project directory to start our new node+express app in dev reloading mode.

```bash
npm install
npm start
```

## Intro Express

[Express](https://expressjs.com/) is a **server side** web framework for Node.js.  What it does for us is provide a way to listen for and respond to incoming web requests. Today, we will be creating API endpoints to respond to certain CRUD-style requests.

Recall that the `src/server.js` file is the entry point for our API. Note how we are setting the route:

```javascript
// default index route
app.get('/', (req, res) => {
  res.send('hi');
});
```

The 2nd parameter to `.get()` is a function that takes 2 arguments: `request` and `response`.

`request` is an express object that contains, among other things, any data that was part of the request. For instance, the JSON parameters we would POST or PUT in our asynchronous `axios` calls would be available as `req.body.parameterName`.

`response` is another special express object that contains, among other things, a method named `send` that allows us a send back a response to the client.  When your API call gets back JSON data this is how it is returned.  Consider `res.send()` the equivalent of a network based `return` statement. This is important. You can only have **1** `res.send()`. Note that it is good practice to `return res.send()` unless you intend to run code after sending the response.

We'll add more routing in shortly, but first let's set up our database!

## Mongo Database Server

We will need a database to store the information aboout the kahoot quizzes and the responses from players. For this version of the assignment, we will be using the non-relational [MongoDB](https://www.mongodb.com/) as our database. We've already installed `mongodb` using Homebrew.

In assignment ~~NNN~~, you will replicate the API with [PostgreSQL](https://www.postgresql.org/), a relational database.

 🚀 You may need to run the `brew services start mongodb-community` process, which your node app will connect to.  This is a background server process. 

Recall you can interface with your database from the commandline using the mongo shell with the command `mongo`.  You can also play around with a more graphical client [mongodb compass community](https://www.mongodb.com/download-center?jmp=nav#compass) (just make sure to download the *community* version).

## Mongoose

<!-- ![](img/mongoose.jpg){: .small .fancy } -->

To interface with mongo for our API, we will use a module called `mongoose`. [Mongoose](http://mongoosejs.com/) is a an object model for mongo. This allows us to treat data that we are storing in mongo as objects that have a nice API for querying, saving, validating, etc. rather than writing Mongo queries directly. Mongo is in general considered a schema-less store.  We store JSON documents in a large object tree similarly to firebase. However, with Mongoose we are able to specify a schema for our objects.  This is purely in code and allows use to validate and assert our data before inserting it into the database to protect us from pesky bugs.

🚀 Install mongoose:  `npm install mongoose`

🚀 Add this snippet to get mongoose initialized with our database at the bottom of `server.js`. We will wrap this in an anonymous `async` function so that we can `await` our call to connect to the database:

```javascript
import mongoose from 'mongoose';

// DB Setup
(async () => {
  // connect mongo
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/kahootAPI';
  await mongoose.connect(mongoURI);

  // start listening
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})();
```

## Models

We're going to create a data model to work with. A data model in mongoose is initialized from a schema, which is a description of the structure of the object. This is much more like what you might be familiar with statically typed classes in Java.

🚀 Create a directory `src/models` and a file inside this directory named `room_model.js`. This is very similar to the express-mongo assignment.


```javascript
import mongoose, { Schema } from 'mongoose';

// schema
const RoomSchema = new Schema({
  creator: String,
  questions: [String],
  answers: [String],
  submissions: [],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

// class
const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
```

Take a look at the `submissions` field of the `Room` model above. We know that the `questions` and `answers` fields should both be the same length, since each answer corresponds to one question. We could validate that these two fields have the same number of elements when a user tries to create a game, but why not combine these two fields into an array of nested documents. Our model will look a lot cleaner, and we will get the validation for free!

We also know that the submissions to a room will be an array, in this case an array of responses from various different players. Don't we also want to check that the submissions follow the correct format? Otherwise, players could submit more answers than the number of questions or submit the wrong type of data in response to the questions. This might cause problems when we later try to evaluate the submissions.

To solve this issue, also create a file `submission_model.js` that contains a `SubmissionModel`. This represents a submission (a series of answers to the room's questions) by one player. The submission will indicate the player who submitted the response and the responses themselves.

While including the the `SubmissionSchema` directly in the `RoomSchema` would work just fine, it would also mean that all the submissions would be stored inside with the rooms that they are for. For the purpose of this assignment, we are going to take a different approach, using mongoose's `populate()` function to retrieve the submission information only when we need it and storing the submissions in a separate collection. This will become more clear once we write the controllers for rooms and submissions.

```javascript
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
```

Now, let's update the `RoomSchema` to include our new combined question/answer format and submission schema.

```javascript
import mongoose, { Schema } from 'mongoose';

// schema
const RoomSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  submissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Submission',
  }],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

// class
const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
```

Finally, let's add a *virtual* to our room schema to compute the "scoreboard" to compare how players are performing in a given game. Add the following code to the bottom of `room_model.js`:

```javascript
function generateScoreboard() {
  const scoreboard = this.submissions.map((submission) => {
    let numCorrect = 0;
    submission.responses.forEach((response, index) => {
      if (response === this.questions[index].answer) {
        numCorrect += 1;
      }
    });
    return { Player: `${submission.player}`, 'Correct Answers': `${numCorrect}` };
  });

  // sort the scoreboard by decreasing number of correct answers
  scoreboard.sort().reverse();
  return scoreboard;
}

RoomSchema.virtual('scoreboard').get(generateScoreboard);
```

## Controllers  

🚀 Create a directory `src/controllers` and a file inside this named `room_controller.js`.  This controller will be responsible for handling all the requests related to rooms (aka games) for our API:

```javascript
export const createRoom = (roomInitInfo) => {
    
};

export const deleteRoom = (roomID) => {
    
};

export const getRoomInfo = (roomID) => {

};

export const getAllRooms = () => {

};

export const getScoreboard = async (roomID) => {
  
};
```

Also add a file `submission_controller.js` that will handle submissions-related requests.

```javascript
export const submit = async (roomID, user, responses) => {
    
};
```

These are empty right now, but we will come back to them soon.

### Routing

Before we finish the controllers, let's finish our routes. In the first assignment, we put our routes in `src/server.js`, now we'll move them out to a new file, `src/routes.js`:

```javascript
// default index route
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
      return res.json(`Created room with id: ${result.id}`);
    } catch (err) {
      return res.status(500).json({ err });
    }
  });

router.route('/rooms/:id')
  .get(async (req, res) => {
    const roomID = req.params.id;
    try {
      const roomInfo = await Rooms.getRoomInfo(roomID);
      return res.json(roomInfo);
    } catch (err) {
      return res.status(404).send(`ERROR: ${err}`);
    }
  })
  .delete(async (req, res) => {
    const roomID = req.params.id;
    try {
      await Rooms.deleteRoom(roomID);
      return res.json({ message: `Room ${roomID} deleted successfully` });
    } catch (err) {
      return res.status(500).json({ err });
    }
  });

router.get('/rooms/:id/scoreboard', async (req, res) => {
  const roomID = req.params.id;
  try {
    const scoreboard = await Rooms.getScoreboard(roomID);
    return res.json(scoreboard);
  } catch {
    return res.status(404).json({ message: 'Room not found' });
  }
});

router.post('/rooms/:id/submission', async (req, res) => {
  const roomID = req.params.id;
  const { player, responses } = req.body;

  try {
    await Rooms.submit(roomID, player, responses);
    return res.json({ message: 'Submitted successfully' });
  } catch (err) {
    return res.status(500).json(`${err}`);
  }
});

export default router;
```

## Back to Controllers

Now we'll finish the controllers 


## Deploy to Heroku

Great! We have everything working now. We will need to host this new server component! While this serves up a webpage, since it is a computed page it needs a live running server process (unlike the static hosting which serves up pre-computed files). Heroku is a lovely service that can host your javascript/node server program (as well as python, and others). 

1. Head over to [Heroku](https://www.heroku.com/) and login/sign up. Then, create a new app.
3. Go to *Deploy* and select either "Github" (strongly preferred) or "Heroku Git" as your Deployment Method
    * if you choose GitHub, find and connect to the right repository, then turn on *Automatic Deploys* for the main branch. This will update Heroku whenever you `git push origin main` and restart your heroku server. This way is pretty automatic and you don't have to worry about remembering to push to heroku.
    * if you are doing "Heroku Git", select Download and install the Heroku CLI using `brew install heroku/brew/heroku`. Given that you're already working in a git repository, use `heroku git:remote -a YOUR_HEROKU_APP` to add a new git remote (use `git remote -v` to see). If you haven't done so already, add and commit your changes. Now when you want to deploy do: `git push heroku main`. *Note: Don't forget to push main to **both** heroku and origin.* This way is more manual if you want greater control.
4. Either way, once Heroku gets your push then it will run the npm command that is listed in your `Procfile` to launch your app.  COOL!


## MongoDB Atlas 

Wait, but we don't have a database on our remote server!  The problem is that Heroku does not support easy storage, there is no "hard drive" to save a database file on for instance. Every Heroku process (what runs your code every time you push), is called a Dyno - and Dynos don't get their own filesystems. They get what Heroku calls an [ephemeral filesystem](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), more of a temporary scratchpad. 

To run a mongoDB process with remote access there are several options, but we'll choose the cloud mongo option offered by mongodb.com.  

1. Create an account at [cloud.mongodb.co](https://www.mongodb.com/cloud/atlas/signup)
1. Select the free *Shared Clusters*. 
1. Pick most the defaults, in particular under *Cluster Tier* Select the `M0 Sandbox`(which is free). Don't turn on backups as that will add cost.
1. This will create a "Project 0" with "Cluster 0". You are limited to 1 free cluster per project, so later on you may want to create more. For now it is probably fine to use the same database for all your projects.
1. Create an access username and password. Save them. 
    ![](img/newuser0.jpg){: .medium .fancy}
    ![](img/newuser.jpg){: .medium .fancy}
1. In *Network Access*, select *Allow Access From Anywhere*
    ![](img/network.jpg){: .medium .fancy}
1. Click *Clusters* -> *Connect* -> *Connect Your Application*
1. Copy the connection string into a safe place and replace `<password>` with the password you saved earlier.


## Connect Heroku to Mongo 

1. Now you need to connect to a mongo database. Go to [dashboard.heroku.com](https://dashboard.heroku.com).
1. Go to *Settings* -> *Reveal Config Vars*
    This is where you can add environment variables — a great place for things like api keys and connection strings.
1. Add a key `MONGODB_URI` and paste the connection string you saved above into it. Remember to replace `<password>` with the actual password. 

## Test it out!  

To test it out, click *Open App* at the top right. That is the url that your heroku server is hosted at.

![](img/test.jpg){: .small .fancy}

You can also view server logs and restart the server from there, where can be very useful in debugging.
