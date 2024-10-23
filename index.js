require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT;

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");

const app = express();
app.use(express.json());

app.use(express.static("public"));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Adjust this path as needed
});


async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
  app.listen(PORT);
  console.log("listening on port " + PORT);
}

main();
