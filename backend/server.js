const app = require('./app');
const database = require("./database/db");
const UserService = require('./endpoints/user/UserService');
require('dotenv').config();

database.initDb(function (err, db) {
    if (err) {
        console.error("Database initialisation failed", err);
        return;
    }
    UserService.automaticallyCreateAdmin();
    console.log("Datenbank Anbindung erfolgreich");
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`App listening at localhost:${PORT}`);
});