const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      default: "", // Email optional hai
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'user', // 'provider' or 'user'
    },
    // 🏠 ADDRESS LIST ADDED HERE
    addresses: [
      {
        label: { type: String, required: true }, // Jaise: "Home", "Office"
        fullAddress: { type: String, required: true }, // Poora pata
      }
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;