require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const itemsRouter = require("./routes/items");
const adminRouter = require("./routes/admin");
const mobileRouter = require("./routes/mobile");

const User = require("./models/user");
const Order = require("./models/order");
const AdminUser = require("./models/adminUser");
const Inventory = require("./models/inventory");
const Appointment = require("./models/appointment");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(itemsRouter);
app.use(adminRouter);
app.use(mobileRouter);

// Connect to MongoDB
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log(
    `Connected to MongoDB database: ${mongoose.connection.db.databaseName}`
  );
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

// Firebase setup
const serviceAccount = require("./gravasend-965f7-firebase-adminsdk-ts4oz-eebc1a8275.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gravasend-965f7-default-rtdb.firebaseio.com",
});

const firebasedb = admin.database();
firebasedb
  .ref("/")
  .once("value")
  .then(() => console.log("Connected to Firebase"))
  .catch((error) => console.error("Firebase connection error:", error));

// Serve static files from the React app
// app.use(express.static(path.join(__dirname, "../build")));

// The "catchall" handler: for any request that doesn't
// match one above, send back the index.html file.
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../build", "index.html"));
// });

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
