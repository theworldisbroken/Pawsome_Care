const supertest = require("supertest");
const app = require("../../app");
const { getBookings, createBooking } = require("../../endpoints/booking/BookingService");
const User = require("../../endpoints/user/UserModel")
const UserProfile = require("../../endpoints/userProfile/UserProfileModel")
const mongoose = require('mongoose');
const Slot = require("../../endpoints/booking/SlotModel");


let token;
let john, bob, fred;
let profileJohn, profileBob, profileFred;
let slot1, slot2, slot3, slot4, slot5, slot6, slot7, slot8, slot9, slot10;

const date1 = new Date(2023, 11, 19);
const date2 = new Date(2023, 11, 21);
const date3 = new Date(2023, 11, 22);

const time1 = "14:15"
const time2 = "14:30"
const time3 = "14:45"
const time4 = "16:15"
const time5 = "16:30"
const ObjectId = mongoose.Types.ObjectId;


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
  fred = await User.create({
    userID: "Fred",
    email: "fred@some-host.de",
    password: "P4SSW0RT!",
  });


  profileJohn = await UserProfile.updateOne({ user: john._id }, {
    user: john._id,
    dog: true,
    cat: false,
    gassi: { offered: true, price: 5 },
    tierarzt: { offered: true, price: 2 },
    training: { offered: true, price: 3 },
    hausbesuch: { offered: true, price: 4 },
    herberge: { offered: false, price: 4 },
    location: {type: 'Point' , address: "12345 Berlin, Deutschland", coordinates: [51,10]}
  });

  profileBob = await UserProfile.updateOne({ user: bob._id }, {
    user: bob._id,
    dog: false,
    cat: true,
    gassi: { offered: true, price: 5 },
    tierarzt: { offered: true, price: 2 },
    training: { offered: true, price: 3 },
    hausbesuch: { offered: true, price: 4 },
    herberge: { offered: false, price: 4 },
    location: {type: 'Point' , address: "12345 Berlin, Deutschland", coordinates: [51,10]}
  });

  profileFred = await UserProfile.updateOne({ user: fred._id }, {
    user: fred._id,
    dog: true,
    cat: true,
    gassi: { offered: true, price: 5 },
    tierarzt: { offered: true, price: 2 },
    training: { offered: true, price: 3 },
    hausbesuch: { offered: true, price: 4 },
    herberge: { offered: false, price: 4 },
    location: {type: 'Point' , address: "12345 Berlin, Deutschland", coordinates: [51,10]}
  });


  slot1 = await Slot.create({
    creator: john._id,
    date: date1,
    time: time1
  });

  slot2 = await Slot.create({
    creator: john._id,
    date: date2,
    time: time1
  });

  slot3 = await Slot.create({
    creator: john._id,
    date: date3,
    time: time1
  });

  slot4 = await Slot.create({
    creator: bob._id,
    date: date1,
    time: time3
  });

  slot5 = await Slot.create({
    creator: fred._id,
    date: date1,
    time: time3
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
    .get(`/api/search`)

  expect(response.statusCode).toBe(200);
  expect(response.body.profiles).toHaveLength(3);

});

test("GET /profile", async () => {
  const response = await supertest(app)
    .get(`/api/search?services=gassi&pets=dog`)

  expect(response.statusCode).toBe(200);
  expect(response.body.profiles).toHaveLength(2);

});

test("GET /profile", async () => {
  const response = await supertest(app)
    .get(`/api/search?times=${time1}`)

  expect(response.statusCode).toBe(200);
  expect(response.body.profiles).toHaveLength(1);

});

test("GET /profile", async () => {
  const response = await supertest(app)
    .get(`/api/search?times=${time1}&times=${time3}`)

  expect(response.statusCode).toBe(200);
  expect(response.body.profiles).toHaveLength(3);

});

test("GET /profile", async () => {
  const queryDate = date1.toISOString();
  const response = await supertest(app)
    .get(`/api/search?dates=${queryDate}`)

  expect(response.statusCode).toBe(200);
  expect(response.body.profiles).toHaveLength(3);

});

/*   test("GET /profile", async () => {
    const response = await supertest(app)
      .get(`/api/search?dates=${date2.toISOString()}&dates=${date3.toISOString()}`)
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);

  }); */