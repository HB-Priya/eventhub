const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// --- ROUTES ---

// 1. Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Hardcode admin logic for specific email for demo purposes
    // UPDATED: Changed to business email
    const isAdmin = email === 'thirupalappaeventhub@gmail.com';

    const newUser = new User({ name, email, password: hashedPassword, isAdmin });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, ...bookingData } = req.body;
    const newBooking = new Booking({ ...bookingData, userId });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Get Bookings (Handles both User History and Admin Overview)
app.get('/api/bookings', async (req, res) => {
  try {
    const { userId, isAdmin } = req.query;
    
    let bookings;
    if (isAdmin === 'true') {
      // Agency View: Fetch ALL bookings sorted by newest
      bookings = await Booking.find().sort({ createdAt: -1 });
    } else {
      // Customer View: Fetch only their bookings
      bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    }
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
