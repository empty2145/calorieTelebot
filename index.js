// index.js
require("dotenv").config();
const { connectDB } = require("./controller/lib/db");
const express = require('express');
const PORT = process.env.PORT || 4040;
const { handler } = require("./controller/index");

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
    // check the database connection verytime a message is sent
    await connectDB();

    console.log(req.body);
    res.send(await handler(req));
});
app.get("/", async (req, res) => {
    await connectDB();
    res.send(await handler(req));
});
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
})
module.exports = app;