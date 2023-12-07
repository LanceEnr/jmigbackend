const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    _appointmentNum: {
      type: Number,
      unique: true,
    },
    _date: String,
    _status: String,
    _userName: String,
    _dayOfWeek: String,
    _time: String,
    _fName: String,
    _lName: String,
    _email: String,
    _note: String,
    _phone: String,
    _dateTime: String,
    _reasonResched: String,
    _cancelReason: String,
  },
  { collection: "appointment" }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
