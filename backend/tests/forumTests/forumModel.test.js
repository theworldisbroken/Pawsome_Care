const mongoose = require('mongoose');
const Post = require('../../endpoints/forum/ForumModel');
const User = require('../../endpoints/user/UserModel');


// Before each test: Clear the database
beforeEach(async () => {
  await Post.deleteMany({});
});

// Test cases for the Post model
describe('Post Model Tests', () => {
  it('should create a new post', async () => {
    const postData = {
      title: 'Test Post',
      content: 'This is a test post.',
      user: new mongoose.Types.ObjectId(), // Change here
      category: 'Test Category',
    };

    const post = await Post.create(postData);

    expect(post.title).toBe(postData.title);
    expect(post.content).toBe(postData.content);
    expect(post.user).toEqual(postData.user);
    expect(post.category).toBe(postData.category);
  });

  it('should not create a post without required fields', async () => {
    try {
      await Post.create({}); // Attempt to create a post without required fields
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    }
  });
});



