const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const userSchema = new mongoose.Schema(
  {
    _email: String,
    _pwd: String,
    _fName: String,
    _lName: String,
    _userName: String,
    _phone: String,
    _bday: String,
    _address: String,
    _iv: String,
    _encryptionKey: String,
    _profilePicture: String,
  },
  { collection: "user" }
);

module.exports = mongoose.model("User", userSchema);
