const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    _faqNum: Number,
    _question: String,
    _answer: String,
  },
  { collection: "faq" }
);

module.exports = mongoose.model("FAQ", faqSchema);
