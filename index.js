// index.js
require("dotenv").config();
const { connectDB } = require("./controller/lib/db");
connectDB();
const express = require('express');
const PORT = process.env.PORT || 4040;
const { handler } = require("./controller/index");

const app = express();
app.use(express.json());

app.post("/*splat", async (req, res) => {
    console.log(req.body);
    res.send(await handler(req));
});
app.get("/*splat", async (req, res) => {
    res.send(await handler(req));
});
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
})