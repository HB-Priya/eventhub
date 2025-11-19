const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  serviceId: { type: String, required: true },
  serviceTitle: { type: String, required: true },
  date: { type: String, required: true },
  guestCount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Confirmed', 'Pending', 'Completed'], default: 'Confirmed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);