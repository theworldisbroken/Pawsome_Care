const supertest = require('supertest');
const app = require("../../app");

const ForumService = require('../../endpoints/forum/ForumService');
const Post = require('../../endpoints/forum/ForumModel');
const User = require("../../endpoints/user/UserModel")
const mongoose = require('mongoose');
const AuthenticationService = require('../../endpoints/authentication/AuthenticationService');

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
  // Perform a login to get the token
  const loginResponse = await supertest(app)
    .get("/api/authenticate")
    .set('Authorization', 'Basic ' + Buffer.from("john@some-host.de:P4SSW0RT!").toString('base64'));

  token = loginResponse.headers['authorization']?.split(' ')[1];
  expect(token).toBeDefined();
});



test('should get all posts', async () => {
  const response = await supertest(app).get('/api/forum');
  expect(response.status).toBe(200);
  expect(response.body[0].title).toBe('Test Post');
});

test('should get a post by ID', async () => {
  const response = await supertest(app).get(`/api/forum/${post._id}`);
  expect(response.status).toBe(200);
  expect(response.body.title).toBe('Test Post');
});

test('should handle post creation', async () => {
  const response = await supertest(app)
    .post('/api/forum')
    .send({
      title: 'Test Post2',
      content: 'This is a test post.',
      user: john._id,
      category: 'Test Category',
    })
    .set("Authorization", `Bearer ${token}`);


  expect(response.status).toBe(201);
  expect(response.body.title).toBe('Test Post2');
});

test('should handle post update for administrator', async () => {
  const response = await supertest(app)
    .put(`/api/forum/${post._id}`)
    .send({
      title: 'Updated Post',
    })    
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.title).toBe('Updated Post');
});


test('should handle post deletion', async () => {
  const response = await supertest(app)
  .delete(`/api/forum/${post._id}`)
  .set("Authorization", `Bearer ${token}`);
  

  expect(response.status).toBe(204);
});

test('should add a comment to a post', async () => {
  const comment = { user: 'John Doe', content: 'A new comment.' };
  const response = await supertest(app)
    .post(`/api/forum/${post._id}/comment`)
    .send(comment)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(201);
});