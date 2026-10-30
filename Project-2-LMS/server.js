require("dotenv").config();
const app = require("./src/app");
const connectToDb = require("./src/db/db");

const PORT = process.env.PORT || 5000;

connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
});
