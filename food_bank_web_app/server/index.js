const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// Models
const Donation = mongoose.model('Donation', {
  userId: String,
  type: String,
  quantity: Number,
  monetaryValue: Number,
  date: Date,
  location: String,
});

const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
});

const Notification = mongoose.model('Notification', {
  message: String,
  date: Date,
  userId: String,
});

// API Endpoints
app.get('/api/donations', async (req, res) => {
  const donations = await Donation.find();
  res.json(donations);
});

app.post('/api/donations', async (req, res) => {
  const donation = new Donation(req.body);
  await donation.save();
  io.emit('new-donation', donation); // Notify clients in real-time
  res.status(201).json(donation);
});

app.post('/api/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/notifications', async (req, res) => {
  const notifications = await Notification.find();
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const notification = new Notification(req.body);
  await notification.save();
  io.emit('new-notification', notification);
  res.status(201).json(notification);
});

// WebSocket for Real-Time Updates
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => console.log('A user disconnected'));
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
