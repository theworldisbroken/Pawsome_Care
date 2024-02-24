const supertest = require("supertest");
const app = require("../../../app"); // Stellen Sie sicher, dass der Pfad zu Ihrer App korrekt ist
const User = require("../../../endpoints/user/UserModel");
const PetPass = require("../../../endpoints/userProfile/petPass/PetPassModel")

let token, token2;
let john, bob;
let petPass;

beforeEach(async () => {
  // Create users for testing
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

  petPass = await PetPass.create({
    creator: john._id,
    type: "Hund",
    name: "Harry",
    race: "Dackel",
    gender: "männlich",
    age: 5,
    size: "mittel",
    fur: "kurz",
    personalities: ["verspielt", "liebevoll"]
  })

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

// Tests für PetPass
test("GET /petpass/:id - Get petpasses for user", async () => {
  const response = await supertest(app)
    .get(`/api/petpass/${john._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(response.body[0].name).toBe("Harry");
});

test("GET /petpass/:id - Negativtest", async () => {
  const response = await supertest(app)
    .get(`/api/petpass/invalid-id`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("POST /petpass - Create a petpass", async () => {
  const response = await supertest(app)
    .post(`/api/petpass`)
    .send({
      creator: john._id,
      type: "Katze",
      name: "Katzo",
      race: "Perser",
      gender: "weiblich",
      age: 4,
      size: "klein",
      fur: "lang",
      personalities: ["faul", "müde"],
      diseases: "viele",
      allergies: "viele",
      houseTrained: false,
      sterilized: false,
      vaccinated: false,
      chipped: true,
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(201);
  expect(response.body.name).toBe("Katzo");
});

test("POST /petpass - 400", async () => {
  const response = await supertest(app)
    .post(`/api/petpass`)
    .send({
      creator: john._id,
      name: "Katzo",
      race: "Perser",
      gender: "weiblich",
      age: 4,
      size: "klein",
      fur: "lang",
      personalities: ["faul", "müde"],
      diseases: "viele",
      allergies: "viele",
      houseTrained: false,
      sterilized: false,
      vaccinated: false,
      chipped: true,
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("POST /petpass - 403", async () => {
  const response = await supertest(app)
    .post(`/api/petpass`)
    .send({
      creator: john._id,
      type: "Katze",
      name: "Katzo",
      race: "Perser",
      gender: "weiblich",
      age: 4,
      size: "klein",
      fur: "lang",
      personalities: ["faul", "müde"],
      diseases: "viele",
      allergies: "viele",
      houseTrained: false,
      sterilized: false,
      vaccinated: false,
      chipped: true,
    })
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});


test("PATCH /petpass/:id - Update a petpass", async () => {
  const response = await supertest(app)
    .patch(`/api/petpass/${petPass._id}`)
    .send({
      type: "Katze",
      name: "Katzo",
    })
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.name).toBe("Katzo");
});

test("PATCH /petpass/:id - 400", async () => {
  const response = await supertest(app)
    .patch(`/api/petpass/invalid-id`)

    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("PATCH /petpass/:id - 403", async () => {
  const response = await supertest(app)
    .patch(`/api/petpass/${petPass._id}`)
    .send({
      type: "Katze",
      name: "Katzo",
    })
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});

test("DELETE /petpass/:id - Delete a petpass", async () => {
  const response = await supertest(app)
    .delete(`/api/petpass/${petPass._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(204);
});

test("DELETE /petpass/:id - 400", async () => {
  const response = await supertest(app)
    .delete(`/api/petpass/invalid-id`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
});

test("DELETE /petpass/:id - 403", async () => {
  const response = await supertest(app)
    .delete(`/api/petpass/${petPass._id}`)
    .set("Authorization", `Bearer ${token2}`);

  expect(response.statusCode).toBe(403);
});