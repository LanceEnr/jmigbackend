const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
  {
    _mission: String,
    image: String,
  },
  { collection: "mission" }
);

module.exports = mongoose.model("Mission", missionSchema);
