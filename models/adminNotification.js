const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const adminNotifSchema = new mongoose.Schema(
  {
    _notifID: {
      type: Number,
      unique: true,
    },
    _date: String,
    _title: String,
    _description: String,
    _name: String,
    _status: String,
  },
  { collection: "adminNotification" }
);

module.exports = mongoose.model("adminNotification", adminNotifSchema);
