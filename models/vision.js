const mongoose = require("mongoose");

const visionSchema = new mongoose.Schema(
  {
    _vision: String,
    image: String,
  },
  { collection: "vision" }
);

module.exports = mongoose.model("Vision", visionSchema);
