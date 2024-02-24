const ForumService = require('../../endpoints/forum/ForumService');
const Post = require('../../endpoints/forum/ForumModel');
const User = require("../../endpoints/user/UserModel")
const mongoose = require ('mongoose');

let john, post;
const ObjectId = mongoose.Types.ObjectId;

beforeEach(async () => {
  await User.syncIndexes()
  john = await User.create({
    userID: "John",
    email: "john@some-host.de",
    password: "P4SSW0RT!",
  });
  post = await Post.create({
    title: 'Test Post',
    content: 'This is a test post.',
    user: john._id,
    category: 'Test Category',
  })
});

test('should get all posts', async () => {
  const result = await ForumService.getAllPosts();
  expect(result[0].title).toBe("Test Post");
});

test('should get a post by ID', async () => {
  const result = await ForumService.getPostById(post._id);
  expect(result.title).toBe("Test Post");
});

test('should create a new post', async () => {

  const result = await ForumService.createPost({
    title: 'Test Post2',
    content: 'This is a test post.',
    user: john._id,
    category: 'Test Category',
  });

  expect(result.title).toBe("Test Post2");
});

test('should update an existing post by ID', async () => {
  const updateData = { title: 'Updated Post', content: 'This post has been updated.' };

  const result = await ForumService.updatePost(post._id, { 
    title: 'Updated Post', 
    content: 'This post has been updated.' 
  });

  expect(result.title).toBe("Updated Post");
});

test('should delete a post by ID', async () => {

  await ForumService.deletePost(post._id);
  const result = Post.findById(post._id).exec()
});

test('should add a comment to a post by ID', async () => {
  const commentData = { user: john._id, content: 'A new comment.' };
  const result = await ForumService.addComment(post._id, commentData);
  expect(result.comment[0].content).toBe("A new comment.");
});

test('should handle errors when getting a post by ID', async () => {
  const invalidID = new ObjectId();
  await expect(ForumService.getPostById(invalidID)).rejects.toThrow("Post not found");
});

test('should handle errors when updating an existing post by ID', async () => {
  const updateData = { title: 'Updated Post', content: 'This post has been updated.' };
  const invalidID = new ObjectId();
  await expect(ForumService.updatePost(invalidID, updateData)).rejects.toThrow("Post not found");
});

it('should handle errors when adding a comment to a post by ID', async () => {
  const commentData = { user: 'John Doe', content: 'A new comment.' };
  const invalidID = new ObjectId();

  await expect(ForumService.addComment(invalidID, commentData)).rejects.toThrow("Post not found");
});
