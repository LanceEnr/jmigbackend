const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Order = require("../models/order");
const Appointment = require("../models/appointment");
const Inquiry = require("../models/inquiry");
const Counter = require("../models/counter");
const Notification = require("../models/customerNotification");
const Notification2 = require("../models/adminNotification");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const iv = crypto.randomBytes(16).toString("hex");
const encryptionKey = crypto.randomBytes(32).toString("hex");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "../src/images/profile/",
  filename: function (req, file, cb) {
    const username = req.body._userName;
    const extname = path.extname(file.originalname);
    const filename = username + extname;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000,
  },
});

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use a valid email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "gravelandsandsupplyjmig@gmail.com", // Your email address
    pass: "dgqg rirx mvlv frix", // Your email password
  },
});
const getNextNotifId = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_notifId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return counter.value;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};
const decryptEmail = (encryptedEmail, iv, encryptionKey) => {
  try {
    if (!encryptedEmail || !iv || !encryptionKey) {
      // Handle missing parameters gracefully
      return "1";
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "hex"),
      Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(encryptedEmail, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting email:", error);
    return "2"; // Handle decryption error gracefully
  }
};

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
const registeredUsers = [
  // Your registered users' data here
];

router.post("/register", async (req, res) => {
  const saltRounds = 10;

  try {
    const {
      _email,
      _pwd,
      _fName,
      _lName,
      _userName,
      _phone,
      _bday,
      _address,
      _date,
    } = req.body;

    const existingUsernameUser = await User.findOne({ _userName });

    const users = await User.find({}, "_email _iv _encryptionKey");
    let isEmailUsed = false;

    for (const user of users) {
      const { _email: encryptedEmail, _iv, _encryptionKey } = user;

      const decryptedEmail = decryptEmail(encryptedEmail, _iv, _encryptionKey);

      if (decryptedEmail === _email) {
        isEmailUsed = true;
        break; // Exit the loop early if a match is found
      }
    }

    if (existingUsernameUser) {
      return res
        .status(409)
        .json({ field: "username", message: "Username already in use" });
    }
    if (isEmailUsed) {
      return res
        .status(409)
        .json({ field: "email", message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(_pwd, saltRounds);

    const cipherForEncryption = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(encryptionKey, "hex"),
      Buffer.from(iv, "hex")
    );
    const encryptedEmailForUser = Buffer.concat([
      cipherForEncryption.update(_email, "utf8"),
      cipherForEncryption.final(),
    ]);
    const userDataToStoreForUser = `${iv}:${encryptionKey}`;

    const newUser = new User({
      _email: encryptedEmailForUser.toString("base64"), // Store the encrypted email in base64 format
      _pwd: hashedPassword,
      _fName,
      _lName,
      _userName,
      _phone,
      _bday,
      _address,
      _iv: iv,
      _encryptionKey: encryptionKey,
    });

    // Save the new user with encrypted email
    await newUser.save();

    const id = await getNextNotifId();

    let customerNotification = new Notification2({
      _notifID: id,
      _date: _date,
      _name: _fName + " " + _lName,
      _title: "New customer registered!",
      _description: _fName + " " + _lName + " registered an account!",
    });
    await customerNotification.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const getNextInquiryNum = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "inquiryID" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};
router.post("/inquiry", async (req, res) => {
  try {
    const { _name, _email, _message, _date } = req.body;
    const id2 = await getNextNotifId();
    const truncatedDescription = _message.substring(0, 20);
    let customerNotification = new Notification2({
      _notifID: id2,
      _date: _date,
      _name: _name,
      _title: _name + " reached out!",
      _description: truncatedDescription,
    });
    await customerNotification.save();
    const id = await getNextInquiryNum();
    const newInquiry = new Inquiry({
      _name,
      _email,
      _message,
      _date,
      _inquiryID: id,
    });

    await newInquiry.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { _pwd, _userName } = req.body;
  try {
    const user = await User.findOne({ _userName });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const passwordMatch = await bcrypt.compare(_pwd, user._pwd);

    if (passwordMatch) {
      const token = jwt.sign({ userId: user._id }, "JMIGGravelandSand", {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Authentication successful",
        token,
        userName: user._userName,
      });
    } else {
      return res.status(401).json({ message: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/order", async (req, res) => {
  try {
    const storedUsername = req.query.userName;
    const user = await User.findOne({ _userName: storedUsername });

    if (user) {
      const fullName = `${user._fName}_${user._lName}`;
      const orders = await Order.find({ _name: fullName })
        .sort({ _orderNum: -1 })
        .exec();

      res.json(orders);
    } else {
      console.error("User not found");
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/appointment", async (req, res) => {
  try {
    const storedUsername = req.query.userName;

    const appointments = await Appointment.find({ _userName: storedUsername })
      .sort({ _appointmentNum: -1 })
      .exec();

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user", async (req, res) => {
  try {
    const storedUsername = req.query.userName;
    const users = await User.find({ _userName: storedUsername });

    const decryptedUsers = [];

    for (const user of users) {
      const totalOrders = await Order.countDocuments({
        _userName: storedUsername,
      });
      const pendingOrders = await Order.countDocuments({
        _userName: storedUsername,
        status: "Pending",
      });

      // Decrypt the email for each user using their IV and encryption key
      const decryptedEmail = decryptEmail(
        user._email,
        user._iv,
        user._encryptionKey
      );

      decryptedUsers.push({
        ...user._doc,
        totalOrders,
        pendingOrders,
        _email: decryptedEmail,
        pic: user._profilePicture,
      });
    }

    res.json(decryptedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/setuser", async (req, res) => {
  try {
    const storedUsername = req.query.userName;
    const users = await User.find({ _userName: storedUsername });

    const selectedFields = users.map((user) => {
      return {
        Phone: user._phone,
        Address: user._address,
        Username: user._userName,
        fName: user._fName,
        lName: user._lName,
        address: user._address,
        pic: user._profilePicture,
      };
    });

    res.json(selectedFields);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/changepassword", async (req, res) => {
  try {
    const { userName, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ _userName: userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user._pwd);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user._pwd = hashedPassword;

    // Save the updated user object
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/updatephoneaddress", async (req, res) => {
  try {
    const { userName, phone, address } = req.body;
    const user = await User.findOne({ _userName: userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user._phone = phone;
    user._address = address;

    await user.save();

    res.status(200).json({ message: "Phone and address updated successfully" });
  } catch (error) {
    console.error("Error updating phone and address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const getNextAppointmentNum = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "appointmentNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  const offset = 41000000;
  const orderIdWithOffset = counter.value + offset;
  return orderIdWithOffset;
};
router.post("/save-appointment", async (req, res) => {
  try {
    const {
      _userName,
      _note,
      _date,
      _fName,
      _lName,
      _phone,
      _time,
      _email,
      _dateTime,
      _dateNow,
    } = req.body;
    // Check if an appointment with the same date, time, and status "Cancelled" exists
    const existingAppointment = await Appointment.findOne({
      _date,
      _time,
      _status: { $ne: "Cancelled" }, // Exclude "Cancelled" status
    });

    if (existingAppointment) {
      // An appointment with the same date and time already exists and is not cancelled
      return res.status(400).json({ error: "Appointment conflict" });
    }

    const existingAppointment2 = await Appointment.findOne({
      _userName,
      _status: "Upcoming",
    });

    if (existingAppointment2) {
      // The user already has an upcoming appointment
      return res
        .status(400)
        .json({ error: "You can only set an appointment one at a time!" });
    }

    const id = await getNextNotifId();

    let customerNotification = new Notification2({
      _notifID: id,
      _date: _dateNow,
      _name: _fName + " " + _lName,
      _title: "New appointment scheduled!",
      _description: _fName + " " + _lName + " scheduled an appointment",
    });
    await customerNotification.save();

    const _appointmentNum = await getNextAppointmentNum();
    const appointment = new Appointment({
      _appointmentNum,
      _userName,
      _note,
      _date,
      _fName,
      _lName,
      _phone,
      _email,
      _time,
      _status: "Upcoming",
      _dateTime,
      _reasonResched: "",
      _cancelReason: "",
    });

    await appointment.save();

    res.json({ message: "Appointment saved successfully" });
  } catch (error) {
    console.error("Error saving appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cancel-appointment", async (req, res) => {
  try {
    const { _appointmentNum, _status, _date, _userName } = req.body;
    const appointment = await Appointment.findOne({ _appointmentNum });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment._status = _status;
    await appointment.save();

    const users = await User.find({ _userName: _userName });
    for (const user of users) {
      const id = await getNextNotifId();
      let customerNotification = new Notification2({
        _notifID: id,
        _date: _date,
        _name: user._fName + " " + user._lName,
        _title: "Appointment Cancelled",
        _description:
          user._fName + " " + user._lName + " cancelled the appointment",
      });
      await customerNotification.save();
    }

    res.json({ message: "Appointment canceled successfully" });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update-appointment", async (req, res) => {
  const {
    appointmentNum,
    _userName,
    _note,
    _date,
    _fName,
    _lName,
    _phone,
    _time,
    _email,
    _dateTime,
    _dateNow,
  } = req.body;

  try {
    const existingAppointment = await Appointment.findOne({
      _date,
      _time,
      _status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "Appointment conflict" });
    }

    const id = await getNextNotifId();

    let customerNotification = new Notification2({
      _notifID: id,
      _date: _dateNow,
      _name: _fName + " " + _lName,
      _title: "Appointment Rescheduled",
      _description: _fName + " " + _lName + " rescheduled the appointment",
    });
    await customerNotification.save();

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _appointmentNum: appointmentNum },
      {
        $set: {
          _userName,
          _note,
          _date,
          _fName,
          _lName,
          _phone,
          _time,
          _email,
          _dateTime,
        },
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
      console.log("Appointment not found");
    }

    // Respond with a success message
    return res.status(200).json({ message: "Appointment edited successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error updating appointment:", error);
    console.log("Error updating appointment");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-counts", async (req, res) => {
  const storedUsername = req.query.userName;
  const users = await User.find({ _userName: storedUsername });
  if (users) {
    try {
      for (const user of users) {
        const fullName = `${user._fName}_${user._lName}`;

        const ordersCount = await Order.countDocuments({
          _name: fullName,
        });
        const appointmentsCount = await Appointment.countDocuments({
          _userName: storedUsername,
        });
        res.json({
          totalOrders: ordersCount,
          totalAppointments: appointmentsCount,
        });
      }
    } catch (error) {
      console.error("Error fetching counts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    console.error("User not found");
  }
});
router.post("/check-email", async (req, res) => {
  const { _email } = req.body;

  const users = await User.find({}, "_email _iv _encryptionKey");
  let isEmailUsed = false;
  for (const user of users) {
    const { _email: encryptedEmail, _iv, _encryptionKey } = user;

    const decryptedEmail = decryptEmail(encryptedEmail, _iv, _encryptionKey);

    if (decryptedEmail === _email) {
      isEmailUsed = true;
      break;
    }
  }
  if (isEmailUsed) {
    res.json({ exists: isEmailUsed });
  } else {
    res.json({ exists: isEmailUsed });
  }
});

router.post("/send-otp", async (req, res) => {
  const { _email } = req.body;

  const otp = generateOTP();

  const mailOptions = {
    to: _email,
    subject: "Password Reset One-Time Password (OTP)",
    text: `Dear User,

We have received a request to reset your password for JMIG Gravel and Sand Supply. Your One-Time Password (OTP) for the password reset process is: ${otp}

Please enter this OTP on the reset password page to continue with the password reset procedure.

If you did not request this password reset, please ignore this email.

Sincerely,
JMIG Gravel and Sand Supply`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error("Error sending OTP:", error);
      res.json({ success: false });
    } else {
      console.log("OTP sent successfully.");
      res.json({ success: true, otp: otp });
    }
  });
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    let getEmail = "";
    const users = await User.find({}, "_email _iv _encryptionKey");
    let emailVerified = false;
    for (const user of users) {
      const { _email: encryptedEmail, _iv, _encryptionKey } = user;

      const decryptedEmail = decryptEmail(encryptedEmail, _iv, _encryptionKey);

      if (decryptedEmail === email) {
        getEmail = encryptedEmail;
      }
    }
    const user = await User.findOne({ _email: getEmail });
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user._pwd = hashedPassword;

    await user.save();

    res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset password." });
  }
});
router.get("/fetch-notifications", async (req, res) => {
  try {
    const userName = req.query.userName;
    const users = await User.find({ _userName: userName });

    for (const user of users) {
      const fName = user._fName;
      const lName = user._lName;
      const name = fName + "_" + lName;

      const notif = await Notification.find({ _name: name }).sort({
        _notifID: -1,
      });

      res.json(notif);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});
router.put(
  "/update-user-profilepic",
  upload.single("image"),
  async (req, res) => {
    try {
      let image = req.body.image;

      if (req.file) {
        image = req.file.path;

        const existingCategory = req.body._userName;

        const extname = path.extname(image);

        const oldImagePath = "images/profile/" + existingCategory + extname;

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const existingUser = await User.findOne();

      if (!existingUser) {
        return res.status(404).json({ error: "Banner not found" });
      }

      existingUser._profilePicture = image;

      await existingUser.save();

      res.status(200).json({ message: "Banner updated successfully" });
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(500).json({ error: "Banner update failed" });
    }
  }
);

router.get("/fetch-profile-pic/:_userName", async (req, res) => {
  const { _userName } = req.params;

  try {
    const user = await User.findOne({ _userName: _userName });

    res.json(user);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
