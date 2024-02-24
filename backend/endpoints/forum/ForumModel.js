const mongoose = require('mongoose');

// Schema for forum posts
// Title of type String, required
// Content of type String, required
// User from the database
// Category display from the database
// Likes of type Number, starting from 0
// Creation date of type Date, current date
// Last edited at of type Date, current date
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user model
  },
  category: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  postPicture: String,
  edited: { type: Boolean, default: false },
  comment: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    edited: { type: Boolean, default: false }
  }]
});

const Post = mongoose.model('Post', postSchema);

// Export Post
module.exports = Post
