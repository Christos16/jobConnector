const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const connectDB = require('./config/db');

//In order to use request.body, we need to bring body-parser

//We want to bring in the api files that we created, the post.js, profile.js.
const users = require('./routes/api/user');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.use(passport.initialize());

//Passport Config
require('./config/passport')(passport);

// Here we assign each routes of the folder api to respective routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}...`));
