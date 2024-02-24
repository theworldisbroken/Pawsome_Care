const supertest = require("supertest");
const app = require("../../app");
const UserService = require("../../endpoints/user/UserService")

let AdminToken;
let SarahToken;

beforeAll(async () => {
    await UserService.automaticallyCreateAdmin();
})

test("Login mit Basic Authentication als admin mit korrekten Credentials", async () => {
    const username = 'admin';
    const password = 'Pawsomecare2324';
    const response = await supertest(app)
        .get("/api/authenticate")
        .set('Authorization', 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'));

    expect(response.statusCode).toBe(200);
    AdminToken = response.headers.authorization?.split(' ')[1];
    expect(AdminToken).toBeDefined();
});

test("Login mit Basic Authentication als admin mit falschen Credentials", async () => {
    const username = 'admin@bht-berlin.de';
    const password = '1233';
    const response = await supertest(app)
        .get("/api/authenticate")
        .set('Authorization', 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'));

    expect(response.statusCode).toBe(401);
});

test("Anlegen einen neuen user sarah(Registrierung)/Anlegen einen existierten user sarah", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const response = await supertest(app)
        .post("/api/users")
        .send(body)

    expect(response.statusCode).toBe(201);

    const response1 = await supertest(app)
        .post("/api/users")
        .send(body)

    expect(response1.statusCode).toBe(400);
});

test("Auflisten aller Nutzer, ohne AdminToken", async () => {
    const response = await supertest(app)
        .get("/api/users")

    expect(response.statusCode).toBe(401);
});

test("Auflisten aller Nutzer als admin", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const sarah = await supertest(app)
        .post("/api/users")
        .send(body)

    const body1 = {
        userID: 'hanah',
        email: 'hanah@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const laura = await supertest(app)
        .post("/api/users")
        .send(body1)

    const response = await supertest(app)
        .get("/api/users")
        .set('Authorization', 'Basic ' + AdminToken);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body).toBeDefined();

});

test("Abrufen des Users sarah mit dem AdminToken", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const sarah = await supertest(app)
        .post("/api/users")
        .send(body)

    const response = await supertest(app)
        .get("/api/users/sarah")
        .set('Authorization', 'Basic ' + AdminToken);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeDefined();
});

test("Login mit Basic Authentication als admin mit korrekten Credentials", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const sarah = await supertest(app)
        .post("/api/users")
        .send(body)

    const username = 'sarah';
    const password = 'P4SSW0RT!';
    const response = await supertest(app)
        .get("/api/authenticate")
        .set('Authorization', 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'));

    expect(response.statusCode).toBe(200);
    SarahToken = response.headers.authorization?.split(' ')[1];
    expect(SarahToken).toBeDefined();
});

test("Abrufen des Users sarah mit dem AdminToken", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const sarah = await supertest(app)
        .post("/api/users")
        .send(body)

    const response = await supertest(app)
        .get("/api/users/admin")
        .set('Authorization', 'Basic ' + SarahToken);

    expect(response.statusCode).toBe(401);
});

test("Ändere beim User sarah die unerlaubte Veriablen", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const sarah = await supertest(app)
        .post("/api/users")
        .send(body)

    const response = await supertest(app)
        .put("/api/users/sarah")
        .send({ isAdministrator: true })
        .set('Authorization', 'Basic ' + SarahToken);

    expect(response.statusCode).toBe(401);
});

test("Ändere von Admin beim User sarah den userID zu lara und dann löschen ", async () => {
    const body = {
        userID: 'Sarah',
        email: 'girzojartu@gufum.com',
        firstName: 'Sarah',
        lastName: 'Mustermann',
        password: 'P4SSW0RT!'
    };
    const sarah = await supertest(app)
        .post("/api/users")
        .send(body)

    const response = await supertest(app)
        .put("/api/users/sarah")
        .send({ userID: "lara" })
        .set('Authorization', 'Basic ' + AdminToken);

    expect(response.statusCode).toBe(200);

    const DelSarah = await supertest(app)
        .delete("/api/users/lara")
        .set('Authorization', 'Basic ' + AdminToken);

    expect(DelSarah.statusCode).toBe(204);
});