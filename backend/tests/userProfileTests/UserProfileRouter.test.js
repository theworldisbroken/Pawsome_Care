const supertest = require("supertest");
const app = require("../../app");
const { getBookings, createBooking } = require("../../endpoints/booking/BookingService");
const User = require("../../endpoints/user/UserModel")
const Booking = require("../../endpoints/booking/BookingModel");


let token;
let john;
let bob;

beforeEach(async () => {
  // Create a user for testing
  john = await User.create({
    userID: "John",
    email: "john@some-host.de",
    password: "P4SSW0RT!",
  });
  bob = await User.create({
    userID: "Bob",
    email: "bob@some-host.de",
    password: "P4SSW0RT!",
  });


  // Perform a login to get the token
  const loginResponse = await supertest(app)
    .get("/api/authenticate")
    .set('Authorization', 'Basic ' + Buffer.from("john@some-host.de:P4SSW0RT!").toString('base64'));

  token = loginResponse.headers['authorization']?.split(' ')[1];
  expect(token).toBeDefined();

  // Perform a second login to get the token
  const loginResponse2 = await supertest(app)
    .get("/api/authenticate")
    .set('Authorization', 'Basic ' + Buffer.from("bob@some-host.de:P4SSW0RT!").toString('base64'));

  token2 = loginResponse2.headers['authorization']?.split(' ')[1];
  expect(token2).toBeDefined();
});



test("GET /profile", async () => {
  const response = await supertest(app)
    .get(`/api/profile/${john._id}`)

  expect(response.statusCode).toBe(200);
  const response1 = response.body;
  expect(response1.aboutme).toBe("");
  expect(response1.user._id).toBe(john._id.toString());

});

test("GET /profile Negativtest 400", async () => {
  const response = await supertest(app)
    .get(`/api/profile/hugo`)

  expect(response.statusCode).toBe(400);
});

test("PATCH /profile ", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/patch/${john._id}`)
    .send({
      aboutme: "Hi!",
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.aboutme).toBe("Hi!")
});

test("PATCH /profile 2", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/patch/${john._id}`)
    .send({
      gassi: { offered: true, price: "5" },
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.gassi.price).toBe(5)
});

test("PATCH /profile 3", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/patch/${john._id}`)
    .send({
      location: {address: null, coordinates: [51, 10]},
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.location.address).toBe(null)
  expect(response.body.location.coordinates[0]).toBe(51)
  expect(response.body.location.coordinates[1]).toBe(10)

  const response2 = await supertest(app)
  .patch(`/api/profile/patch/${john._id}`)
  .send({
    location: { address: "12345 Berlin", coordinates: [5, 11]},
  })
  .set("Authorization", `Bearer ${token}`);

expect(response2.statusCode).toBe(200);
expect(response2.body.location.address).toBe("12345 Berlin")
expect(response2.body.location.coordinates[0]).toBe(5)
expect(response2.body.location.coordinates[1]).toBe(11)

const response3 = await supertest(app)
.patch(`/api/profile/patch/${john._id}`)
.send({
  location: { address: null, coordinates: [5, 12]},
})
.set("Authorization", `Bearer ${token}`);

expect(response3.statusCode).toBe(200);
expect(response3.body.location.address).toBe(null)
expect(response3.body.location.coordinates[0]).toBe(5)
expect(response3.body.location.coordinates[1]).toBe(12)
});

test("PATCH /profile Negativtest 400", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/patch/invalid-id`)
    .send({
      aboutme: "Hi!",

    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("PATCH /profile Negativtest 403", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/patch/${john._id}`)
    .send({
      aboutme: "hi",

    })
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});  

test("PATCH /profile/toggle ", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/toggle/`)
    .send({
      userID: john._id,
      favoriteID: bob._id
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
});

test("PATCH /profile/toggle 400 ", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/toggle/`)
    .send({
      userID: "invalid-id",
      favoriteID: bob._id
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("PATCH /profile/toggle 403 ", async () => {
  const response = await supertest(app)
    .patch(`/api/profile/toggle/`)
    .send({
      userID: john._id,
      favoriteID: bob._id
    })
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});