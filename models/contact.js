const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const contactSchema = new mongoose.Schema(
  {
    _address1: String,
    _address2: String,
    _phone1: String,
    _phone2: String,
    _landline: String,
    _email: String,
    _fb: String,
    _messenger: String,
  },
  { collection: "contact" }
);

module.exports = mongoose.model("Contact", contactSchema);
