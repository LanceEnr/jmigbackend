const express = require("express");
const router = express.Router();

const User = require("../models/adminUser");
const CustomerUser = require("../models/user");
const Counter = require("../models/counter");
const Code = require("../models/adminCode");
const Order = require("../models/order");
const Inventory = require("../models/inventory");
const IncomingInventory = require("../models/incomingInventory");
const Values = require("../models/values");
const Notification = require("../models/customerNotification");
const Notification2 = require("../models/adminNotification");
const Appointment = require("../models/appointment");
const Testimonial = require("../models/testimonial");
const Inquiry = require("../models/inquiry");
const Vision = require("../models/vision");
const Mission = require("../models/mission");
const Contact = require("../models/contact");
const Banner = require("../models/banner");
const FAQ = require("../models/faq");
const Listing = require("../models/listing");
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
const historyInventory = require("../models/historyInventory");
//const accountSid = "AC884cb7a63fb7e7784143f86c75d68c71";
//const authToken = "f39a7d524b2617a4fd074986cfd2b53f";

const accountSid = "AC5e511e9476e52d8cb06d77a2873a5d54";
const authToken = "0dcb9f8a1567a4db867974aae24c9f52";
const client = require("twilio")(accountSid, authToken);

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use a valid email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "gravelandsandsupplyjmig@gmail.com", // Your email address
    pass: "dgqg rirx mvlv frix", // Your email password
  },
});

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
const registeredUsers = [];

const sanitizeFilename = (filename) => {
  return filename.replace(/[^\w\s.-]/g, "").replace(/\s+/g, "_");
};
const storage = multer.diskStorage({
  destination: "../src/images/banner/uploads/",
  filename: function (req, file, cb) {
    const category = sanitizeFilename(req.body.category);
    console.log(category);
    const extname = path.extname(file.originalname);
    const filename = category + extname;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100000000,
  },
});

const storageVision = multer.diskStorage({
  destination: "../src/images/banner/uploads/",
  filename: function (req, file, cb) {
    const category = req.body.v;
    const extname = path.extname(file.originalname);
    const filename = category + extname;
    cb(null, filename);
  },
});

const uploadVision = multer({
  storage: storageVision,
  limits: {
    fileSize: 100000000,
  },
});

const storageMission = multer.diskStorage({
  destination: "../src/images/banner/uploads/",
  filename: function (req, file, cb) {
    const category = req.body.m;
    const extname = path.extname(file.originalname);
    const filename = category + extname;
    cb(null, filename);
  },
});

const uploadMission = multer({
  storage: storageMission,
  limits: {
    fileSize: 100000000,
  },
});
const storageProfile = multer.diskStorage({
  destination: "../src/images/profile/",
  filename: function (req, file, cb) {
    const username = req.body._userName;
    const extname = path.extname(file.originalname);
    const filename = username + extname;
    cb(null, filename);
  },
});

const uploadProfile = multer({
  storage: storageProfile,
  limits: {
    fileSize: 10000000,
  },
});

router.post("/adminRegister", async (req, res) => {
  const {
    _email,
    _pwd,
    _fName,
    _lName,
    _userName,
    _phone,
    _bday,
    _address,
    _adminCode,
  } = req.body;
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
      _adminCode,
    } = req.body;

    const existingUsernameUser = await User.findOne({ _userName });
    const adminCodeDoc = await Code.findOne({ _adminCode });

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
      _profilePicture: "",
    });

    if (!adminCodeDoc) {
      // If the admin code is not found, handle the error or return an appropriate response
      return { success: false, message: "Admin code not found" };
    }

    // Update _isRedeem to true
    adminCodeDoc._isRedeem = true;

    // Save the updated document
    await adminCodeDoc.save();

    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/setuser2", async (req, res) => {
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
router.post("/changepassword2", async (req, res) => {
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
router.post("/updatephoneaddress2", async (req, res) => {
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
router.put(
  "/update-user-profilepic2",
  uploadProfile.single("image"),
  async (req, res) => {
    const uname = req.body._userName;
    try {
      let image = req.body.image;

      if (req.file) {
        image = req.file.path;

        const extname = path.extname(image);

        const oldImagePath = "images/profile/" + uname + extname;

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const existingUser = await User.findOne({ _userName: uname });
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

router.get("/fetch-profile-pic2/:_userName", async (req, res) => {
  const { _userName } = req.params;

  try {
    const user = await User.findOne({ _userName: _userName });
    res.json(user);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/adminLogin", async (req, res) => {
  const { _pwd, _userName } = req.body;
  try {
    const user = await User.findOne({ _userName });

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const passwordMatch = await bcrypt.compare(_pwd, user._pwd);

    if (passwordMatch) {
      const adminToken = jwt.sign({ userId: user._id }, "JMIGGravelandSand", {
        expiresIn: "7d",
      });

      return res.status(200).json({
        message: "Authentication successful",
        adminToken,
        adminUsername: _userName,
      });
    } else {
      return res.status(401).json({ message: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
const getNextInventoryNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_inventoryID" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 11000000;
    const orderIdWithOffset = counter.value + offset;
    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};
router.get("/generateId", async (req, res) => {
  try {
    const id = await getNextInventoryNum();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
});
router.get("/currentInventory", async (req, res) => {
  try {
    const data = await Inventory.find(
      { _status: "current" },
      {
        _inventoryID: 1,
        _itemName: 1,
        _quantity: 1,
        _location: 1,
        _lastUpdated: 1,
        _id: 0, // Exclude the default _id field
      }
    );

    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/outgoingInventory", async (req, res) => {
  try {
    const data = await Inventory.find(
      { _status: "outgoing" },
      {
        _inventoryID: 1,
        _itemName: 1,
        _quantity: 1,
        _location: 1,
        _lastUpdated: 1,
        _id: 0, // Exclude the default _id field
      }
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getNextCode = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_codeID" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return counter.value;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};
router.post("/generateCode", async (req, res) => {
  try {
    const _codeID = await getNextCode();

    const { accessCode, formattedDate } = req.body;

    const existingCode = await Code.findOne({
      _adminCode: accessCode,
    });

    if (existingCode) {
      return res.status(400).json({ error: "Admin Code conflict" });
    }

    const code = new Code({
      _isRedeem: "false",
      _adminCode: accessCode,
      _dateTime: formattedDate,
      _codeID: _codeID,
    });

    await code.save();

    res.json(code);
  } catch (error) {
    console.error("Error generating admin code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addInventory", async (req, res) => {
  const { itemName, quantity, location, lastUpdated } = req.body;
  const actionId = await getNextInventoryNum();

  const existingInventory = await Inventory.findOne({
    _inventoryID: actionId,
    _status: "current",
  });

  if (existingInventory) {
    existingInventory._itemName = itemName;
    existingInventory._quantity = quantity;
    existingInventory._location = location;
    existingInventory._lastUpdated = lastUpdated;

    await existingInventory.save();

    return res.json({ message: "Inventory item updated successfully" });
  }

  // Create a new inventory item
  const newInventory = new Inventory({
    _inventoryID: actionId,
    _itemName: itemName,
    _quantity: quantity,
    _location: location,
    _lastUpdated: lastUpdated,
    _status: "current",
  });

  await newInventory.save();

  res.json({ message: "Inventory item saved successfully" });
});

router.post("/addStocks", async (req, res) => {
  const stockDataArray = req.body;
  if (!stockDataArray || stockDataArray.length === 0) {
    return;
  }
  try {
    // Iterate over the stock data array
    for (const stockData of stockDataArray) {
      const itemName = stockData[0];
      const location = stockData[2];

      const quantityToAdd = parseInt(stockData[1], 10); // Convert to a number

      // Find the existing inventory item
      const existingInventory = await Inventory.findOne({
        _itemName: itemName,
        _location: location,
        _status: "current",
      });

      if (existingInventory) {
        const existingQuantity = parseInt(existingInventory._quantity, 10);

        existingInventory._quantity = existingQuantity + quantityToAdd;

        // Update lastUpdated if needed
        existingInventory._lastUpdated = new Date().toISOString();

        await existingInventory.save();
      }
    }

    res.json({ message: "Inventory items updated successfully" });
  } catch (error) {
    console.error("Error updating inventory items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/deleteRecord", async (req, res) => {
  try {
    const id = req.body._inventoryID;

    const removedRecord = await Inventory.findOneAndRemove({
      _inventoryID: id,
    });

    if (removedRecord) {
      res.json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    console.error("Error deleting record", error);
    res
      .status(500)
      .json({ message: "Failed to delete the record", error: error.message });
  }
});
router.get("/get-order", async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from the database
    res.json(orders);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});
router.get("/get-inventoryhistory", async (req, res) => {
  try {
    const history = await historyInventory.find(); // Fetch all orders from the database
    res.json(history);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});
router.get("/get-faq", async (req, res) => {
  try {
    const faq = await FAQ.find();
    res.json(faq);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});
router.get("/get-inquiry", async (req, res) => {
  try {
    const inquiry = await Inquiry.find(); // Fetch all orders from the database
    res.json(inquiry);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});

router.get("/get-events", async (req, res) => {
  try {
    const appointment = await Appointment.find(); // Fetch all orders from the database
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});

const formatPhoneNumber = (phoneNumber) => {
  const numericPhoneNumber = phoneNumber.replace(/\D/g, "");

  if (numericPhoneNumber.startsWith("0")) {
    return `+63${numericPhoneNumber.slice(1)}`;
  } else {
    return `+${numericPhoneNumber}`;
  }
};

router.post("/update-appointment-admin", async (req, res) => {
  const {
    appointmentNum,
    _date,
    _time,
    _dateTime,
    _reasonResched,
    _cancelReason,
    date,
  } = req.body;
  const name = req.body.name;
  const nameParts = name.split("_");
  const [firstName, lastName] = nameParts;

  const user = await CustomerUser.findOne({
    _fName: firstName,
    _lName: lastName,
  });
  const decryptedEmail = decryptEmail(
    user._email,
    user._iv,
    user._encryptionKey
  );

  try {
    const existingAppointment = await Appointment.findOne({
      _date,
      _time,
      _status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "Appointment conflict" });
    }
    const phoneNumber = formatPhoneNumber(user._phone);
    //const phoneNumber = "+639178982217"; // Replace with the recipient's phone number
    const message =
      "Hi " +
      firstName +
      " " +
      lastName +
      " your appointment number of " +
      appointmentNum +
      " was rescheduled " +
      " on " +
      _date +
      " at " +
      _time;

    client.messages
      .create({
        body: message,
        from: "+12295305097",
        to: phoneNumber,
      })
      .then((message) => console.log(`Message sent: ${message.sid}`))
      .catch((error) =>
        console.error(`Error sending message: ${error.message}`)
      );

    const id = await getNextNotifId();
    let customerNotification = new Notification({
      _notifID: id,
      _date: date,
      _name: name,
      _title: "Appointment " + appointmentNum,
      _description:
        "Your appointment was rescheduled" + " on " + _date + " at " + _time,
    });
    await customerNotification.save();

    const mailOptions = {
      to: decryptedEmail,
      subject: "Appointment Reschedule Notification",
      text: `Dear ${firstName} ${lastName},
      
      Appointment Number: ${appointmentNum}

      We hope this email finds you well. We appreciate your scheduled appointment with JMIG Gravel and Sand, and we apologize for any 
      inconvenience this may cause. Due to unforeseen circumstances, we find it necessary to reschedule your appointment.

      Rescheduled Appointment Details:

      Date: ${_date}
      Time: ${_time}

      We understand that your time is valuable, and we sincerely apologize for any disruption. If you have any questions or concerns, 
      or if you need assistance with the rescheduling process, please do not hesitate to contact our customer service team at 025175562
  
       Sincerely,
       JMIG Gravel and Sand Supply`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully.");
      }
    });

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _appointmentNum: appointmentNum },
      {
        $set: {
          _date,
          _time,
          _dateTime,
          _reasonResched,
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
    console.log("Error updating appointmen");
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/complete-appointment-admin", async (req, res) => {
  const { appointmentNum, dateTime, date, name } = req.body;
  const _status = "Completed";
  const id = await getNextNotifId();
  try {
    let customerNotification = new Notification({
      _notifID: id,
      _date: date,
      _dateTime: dateTime,
      _appointmentNum: appointmentNum,
      _name: name,
      _title: "Appointment " + appointmentNum,
      _description: "Your appointment was completed successfully!",
    });
    await customerNotification.save();

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _appointmentNum: appointmentNum },
      {
        $set: {
          _status,
        },
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res
      .status(200)
      .json({ message: "Appointment completed successfully" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cancel-appointment-admin", async (req, res) => {
  const { appointmentNum, _status, _cancelReason, date, dateTime } = req.body;
  const name = req.body.name;
  const nameParts = name.split("_");
  const [firstName, lastName] = nameParts;

  const user = await CustomerUser.findOne({
    _fName: firstName,
    _lName: lastName,
  });
  const decryptedEmail = decryptEmail(
    user._email,
    user._iv,
    user._encryptionKey
  );
  try {
    const id = await getNextNotifId();
    let customerNotification = new Notification({
      _notifID: id,
      _date: date,
      _name: name,
      _title: appointmentNum + " on " + dateTime,
      _description: "Your appointment was cancelled due to " + _cancelReason,
    });
    await customerNotification.save();

    const phoneNumber = formatPhoneNumber(user._phone);
    const message =
      "Hi " +
      firstName +
      " " +
      lastName +
      " your appointment number of " +
      appointmentNum +
      " was canceled. We are sorry for canceling your appointment due to " +
      _cancelReason;

    client.messages
      .create({
        body: message,
        from: "+12295305097",
        to: phoneNumber,
      })
      .then((message) => console.log(`Message sent: ${message.sid}`))
      .catch((error) =>
        console.error(`Error sending message: ${error.message}`)
      );
    const mailOptions = {
      to: decryptedEmail,
      subject: "Appointment Cancellation Notification",
      text: `Dear ${firstName} ${lastName},
      
      Appointment Number: ${appointmentNum}

      We hope this message finds you in good health. We regret to inform you that the scheduled appointment with JMIG Gravel and Sand, 
      originally set for ${dateTime}, has been cancelled due to ${_cancelReason}.

      We understand that this may cause inconvenience, and we sincerely apologize for any disruption to your plans.
      Our team is actively working to reschedule the appointment at your earliest convenience.

      We appreciate your understanding and cooperation.
  
       Sincerely,
       JMIG Gravel and Sand Supply`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully.");
      }
    });
    const cancelAppointment = await Appointment.findOneAndUpdate(
      { _appointmentNum: appointmentNum },
      {
        $set: {
          _status,
          _cancelReason,
        },
      },
      { new: true }
    );

    if (!cancelAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
      console.log("Appointment not found");
    }

    // Respond with a success message
    return res
      .status(200)
      .json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error cancelling appointment:", error);
    console.log("Error cancelling appointment");
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/adminUser", async (req, res) => {
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
        _email: decryptedEmail, // Replace the encrypted email with the decrypted one
      });
    }

    res.json(decryptedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin-changepassword", async (req, res) => {
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

router.post("/admin-check-email", async (req, res) => {
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

router.post("/admin-send-otp", async (req, res) => {
  const { _email } = req.body;

  const otp = generateOTP();

  const mailOptions = {
    to: _email,
    subject: "Password Reset One-Time Password (OTP)",
    text: `Dear Admin,

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

router.post("/admin-reset-password", async (req, res) => {
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

router.get("/accessCodes", async (req, res) => {
  try {
    const codes = await Code.find({}, { _id: 0 }); // Exclude the _id field
    res.json(codes);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});

router.delete("/accessCodes/:adminCode", async (req, res) => {
  const adminCode = req.params.adminCode;

  try {
    // Find and remove the code by _adminCode
    await Code.deleteOne({ _adminCode: adminCode });
    res.status(204).send(); // 204 No Content on successful deletion
  } catch (error) {
    console.error("Error deleting code:", error);
    res.status(500).json({ error: "Failed to delete the code" });
  }
});

router.put("/update-banner", upload.single("image"), async (req, res) => {
  const category = req.body.category;
  const heading = req.body.heading;
  const subheading = req.body.subheading;

  try {
    let image = req.body.image;

    if (req.file) {
      image = req.file.path;

      const existingCategory = req.body.existingCategory;
      if (category !== existingCategory) {
        const extname = path.extname(image);

        const oldImagePath =
          "images/banner/uploads/" + existingCategory + extname;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Find and update the existing banner by category
    const existingBanner = await Banner.findOne({ _bannerType: category });

    if (!existingBanner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    // Update the banner details
    existingBanner._bannerType = category;
    existingBanner._heading = heading;
    existingBanner._subheading = subheading;
    existingBanner._image = image; // Update the image path

    // Save the updated banner
    await existingBanner.save();

    res.status(200).json({ message: "Banner updated successfully" });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Banner update failed" });
  }
});

router.get("/fetch-banner", async (req, res) => {
  try {
    const banner = await Banner.findOne();

    if (!banner) {
      return res.status(404).json({ error: "banner not found" });
    }

    res.json(banner);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetch-category-values/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const banner = await Banner.findOne({ _bannerType: category });

    res.json(banner);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetch-faq/:_faqNum", async (req, res) => {
  const { _faqNum } = req.params;

  try {
    const faq = await FAQ.findOne({ _faqNum: _faqNum });

    res.json(faq);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetch-order/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _orderNum: id });
    res.json(order);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetch-inventory/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const inventory = await Inventory.findOne({ _inventoryID: id });
    res.json(inventory);
  } catch (error) {
    console.error("Error retrieving banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-testimonials", async (req, res) => {
  const updatedTestimonialData = req.body;

  try {
    const existingTestimonial = await Testimonial.findOne();

    if (!existingTestimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    existingTestimonial.set(updatedTestimonialData);

    await existingTestimonial.save();

    res.json({ message: "Testimonial updated successfully" });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-order", async (req, res) => {
  const orderData = req.body;
  const product = req.body.product;
  const _date = req.body._date;
  const _orderNum = orderData._orderNum;
  const parsedId = parseInt(_orderNum, 10);
  const _quantity = parseInt(req.body.quantity, 10);

  const name = req.body.name;
  const nameParts = name.split("_");
  const [firstName, lastName] = nameParts;
  const materialTypeParts = product.split("_");
  const extractedType = materialTypeParts[0];
  const location = materialTypeParts[1];

  const user = await CustomerUser.findOne({
    _fName: firstName,
    _lName: lastName,
  });

  const decryptedEmail = decryptEmail(
    user._email,
    user._iv,
    user._encryptionKey
  );

  try {
    const order = await Order.findOne({ _orderNum: _orderNum });

    let inventory = await Inventory.findOne({
      _itemName: extractedType,
      _location: location,
    });
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    const currentInventoryQuantity = parseInt(inventory._quantity, 10);

    inventory._quantity = currentInventoryQuantity + _quantity;

    await inventory.save();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order._orderDet = orderData.details;
    order._status = orderData.status;
    order._quantity = orderData.quantity;

    await order.save();
    const phoneNumber = formatPhoneNumber(user._phone);
    const message =
      " Your order with order number of " +
      _orderNum +
      " has been updated " +
      extractedType +
      " - " +
      _quantity +
      " cub. mt. (" +
      orderData.status +
      ")";

    client.messages
      .create({
        body: message,
        from: "+12295305097",
        to: phoneNumber,
      })
      .then((message) => console.log(`Message sent: ${message.sid}`))
      .catch((error) =>
        console.error(`Error sending message: ${error.message}`)
      );

    const id = await getNextNotifId();
    let customerNotification = new Notification({
      _notifID: id,
      _date: _date,
      _name: firstName + " " + lastName,
      _title:
        "Your order with order number of " + _orderNum + " has been updated",
      _description:
        extractedType +
        " - " +
        _quantity +
        " cub. mt. (" +
        orderData.status +
        ")",
    });
    await customerNotification.save();

    const mailOptions = {
      to: decryptedEmail,
      subject: "Your Order Update from JMIG Gravel and Sand",
      text: `Dear ${firstName} ${lastName},
      
      Order Number: ${_orderNum}


      We hope this message finds you well. We wanted to inform you that there has been an update to the status of your recent order of ${extractedType}.
       We are pleased to let you know that your order is now ${orderData.status}.
  
       Thank you for choosing JMIG Gravel and Sand. We appreciate your business and look forward to serving you again in the future.
  
       Sincerely,
       JMIG Gravel and Sand Supply`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent successfully.");
      }
    });

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-current", async (req, res) => {
  const inventoryData = req.body;
  const _inventoryID = inventoryData._inventoryID;

  try {
    const inventory = await Inventory.findOne({ _inventoryID: _inventoryID });

    if (!inventory) {
      return res.status(404).json({ error: "Order not found" });
    }

    inventory._itemName = inventoryData.itemName;
    inventory._quantity = inventoryData.quantity;
    inventory._location = inventoryData.location;
    inventory._lastUpdated = inventoryData.lastUpdated;

    console.log(inventory);
    await inventory.save();

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-faq", async (req, res) => {
  const faqData = req.body;
  const _faqNum = faqData._faqNum;

  try {
    const faq = await FAQ.findOne({ _faqNum: _faqNum });

    if (!faq) {
      return res.status(404).json({ error: "Order not found" });
    }

    faq._question = faqData._question;
    faq._answer = faqData._answer;

    await faq.save();

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetch-testimonials", async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne();

    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (error) {
    console.error("Error retrieving testimonial:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-values", async (req, res) => {
  const updatedValueslData = req.body;

  try {
    const existingValues = await Values.findOne();

    if (!existingValues) {
      return res.status(404).json({ error: "Values not found" });
    }

    existingValues.set(updatedValueslData);

    await existingValues.save();

    res.json({ message: "Values updated successfully" });
  } catch (error) {
    console.error("Error updating Values:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetch-values", async (req, res) => {
  try {
    const values = await Values.findOne();

    if (!values) {
      return res.status(404).json({ error: "Values not found" });
    }

    res.json(values);
  } catch (error) {
    console.error("Error retrieving values:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/update-about",
  uploadVision.single("image"),

  async (req, res) => {
    const _vision = req.body._vision;

    try {
      let image = req.body.image;

      if (req.file) {
        image = req.file.path;

        const existingCategory = req.body.v;

        const extname = path.extname(image);

        const oldImagePath =
          "images/banner/uploads/" + existingCategory + extname;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const existingAbout = await Vision.findOne();

      if (!existingAbout) {
        return res.status(404).json({ error: "Banner not found" });
      }

      existingAbout._vision = _vision;
      existingAbout.image = image;

      await existingAbout.save();

      res.status(200).json({ message: "Banner updated successfully" });
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(500).json({ error: "Banner update failed" });
    }
  }
);
router.put(
  "/update-about2",
  uploadMission.single("image"),

  async (req, res) => {
    const _mission = req.body._mission;

    try {
      let image = req.body.image;

      if (req.file) {
        image = req.file.path;

        const existingCategory = req.body.m;

        const extname = path.extname(image);

        const oldImagePath =
          "images/banner/uploads/" + existingCategory + extname;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const existingAbout = await Mission.findOne();

      if (!existingAbout) {
        return res.status(404).json({ error: "Banner not found" });
      }

      existingAbout._mission = _mission;
      existingAbout.image = image;

      await existingAbout.save();

      res.status(200).json({ message: "Banner updated successfully" });
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(500).json({ error: "Banner update failed" });
    }
  }
);

router.get("/fetch-vision", async (req, res) => {
  try {
    const vision = await Vision.findOne();

    if (!vision) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(vision);
  } catch (error) {
    console.error("Error retrieving Vision:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetch-mission", async (req, res) => {
  try {
    const mission = await Mission.findOne();

    if (!mission) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(mission);
  } catch (error) {
    console.error("Error retrieving Mission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-contact", async (req, res) => {
  const contactData = req.body;

  try {
    const existingContact = await Contact.findOne();

    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    existingContact.set(contactData);

    await existingContact.save();

    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    console.error("Error updating Contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetch-contact", async (req, res) => {
  try {
    const contact = await Contact.findOne();

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Error retrieving Contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getNextFAQNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_faqNum" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 1000;
    const orderIdWithOffset = counter.value + offset;
    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};
router.get("/generateFAQId", async (req, res) => {
  try {
    const id = await getNextFAQNum();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
});

router.post("/addFAQ", async (req, res) => {
  console.log(question + " " + answer);
  const id = await getNextFAQNum();
  const exisitingName = await FAQ.findOne({
    _question: question,
  });

  if (exisitingName) {
    return res.status(400).json({ error: "Name conflict" });
  }
  const faq = new FAQ({
    _faqNum: id,
    _question: question,
    _answer: answer,
  });

  await faq.save();

  res.json({ message: "FAQ saved successfully" });
});

router.post("/deleteFAQ/:_faqNum", async (req, res) => {
  try {
    const id = req.params._faqNum;
    const removedRecord = await FAQ.findOneAndRemove({
      _faqNum: id,
    }); // Use findOneAndRemove

    if (removedRecord) {
      res.json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    console.error("Error deleting record", error);
    res
      .status(500)
      .json({ message: "Failed to delete the record", error: error.message });
  }
});

router.get("/get-listing2", async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch listing data" });
  }
});

router.get("/get-listing", async (req, res) => {
  try {
    const listings = await Listing.find({ _isPublished: true });
    res.json(listings);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch listing data" });
  }
});
router.get("/get-listing-details", async (req, res) => {
  const productName = req.query.productName;

  try {
    const listing = await Listing.findOne({ _listingName: productName });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/get-listing-stocks", async (req, res) => {
  const productName = req.query.productName;

  try {
    const stocks = await Inventory.find({ _itemName: productName });

    if (!stocks || stocks.length === 0) {
      return res.status(404).json({ error: "Stocks not found" });
    }

    const stockDetails = stocks.map(({ _location, _quantity }) => ({
      _location,
      _quantity,
    }));

    res.json(stockDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-products", async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});
router.get("/get-products2", async (req, res) => {
  try {
    const allProducts = await Inventory.find();

    // Fetch all listing names
    const listingNames = (await Listing.find()).map(
      (item) => item._listingName
    );

    // Filter out products that are already in the Listing
    const availableProducts = allProducts.filter(
      (product) => !listingNames.includes(product._itemName)
    );
    res.json(availableProducts);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch product data" });
  }
});
router.get("/get-products3", async (req, res) => {
  try {
    const distinctItemNames = await Inventory.distinct("_itemName");
    res.json(distinctItemNames);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});
const getNextListingNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_listingID" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 20000;
    const orderIdWithOffset = counter.value + offset;

    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};

const storage2 = multer.diskStorage({
  destination: "../src/images/listings/",
  filename: function (req, file, cb) {
    const listingName = sanitizeFilename(
      req.body._listingName.replace(/\s+/g, "")
    );

    const extname = path.extname(file.originalname);

    if (!req.fileIndex) {
      req.fileIndex = 1;
    } else {
      req.fileIndex += 1;
    }

    const filename = `${listingName}${req.fileIndex}${extname}`;

    cb(null, filename);
  },
});

const upload2 = multer({
  storage: storage2,
  limits: {
    fileSize: 10000000,
  },
});
router.post("/add-listing", upload2.array("image", 6), async (req, res) => {
  const productName = req.body._listingName;
  const category = req.body._listingCategory;
  const price = req.body._listingPrice;
  const description = req.body._isPublished;
  const images = req.files.map((file) => file.path);
  console.log(description);
  const id = await getNextListingNum();
  if (images.length === 0) {
    return res.status(400).json({ error: "No images were uploaded" });
  }

  const newListing = new Listing({
    _listingID: id,
    _listingName: productName,
    _listingCategory: category,
    _listingPrice: price,
    _listingDescription: description,
    _isPublished: true,
    _imgPath: images,
  });
  await newListing.save();
  res.status(200).json({ message: "Listing added successfully" });
});
router.put("/update-listing", upload2.array("image", 6), async (req, res) => {
  try {
    const listingName = req.body._listingName;
    const price = req.body._listingPrice;
    const description = req.body._listingDescription;
    const isPublished = req.body._isPublished;
    const images = req.files.map((file) => file.path);
    if (images.length === 0) {
      return res.status(400).json({ error: "No images were uploaded" });
    }

    const updatedListing = await Listing.findOneAndUpdate(
      { _listingName: listingName },
      {
        _listingName: listingName,
        _listingPrice: price,
        _listingDescription: description,
        _imgPath: images,
        _isPublished: isPublished,
      },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.status(200).json({ message: "Listing updated successfully" });
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getNextOrderNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_orderID" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const offset = 31000000;
    const orderIdWithOffset = counter.value + offset;

    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};
router.get("/generateorderDateId", async (req, res) => {
  try {
    const id = await getNextOrderNum();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
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

router.post("/addOrder", async (req, res) => {
  const { _name, _materialType, _date, _status, _price, _orderDet } = req.body;
  const _orderNum = await getNextOrderNum();
  const _quantity = parseInt(req.body._quantity, 10);
  const name = req.body._name;
  const quantity = _quantity;
  const nameParts = name.split("_");
  const [firstName, lastName] = nameParts;
  const materialTypeParts = _materialType.split("_");
  const extractedType = materialTypeParts[0];
  const location = materialTypeParts[1];

  const user = await CustomerUser.findOne({
    _fName: firstName,
    _lName: lastName,
  });

  const decryptedEmail = decryptEmail(
    user._email,
    user._iv,
    user._encryptionKey
  );

  try {
    let order = await Order.findOne({ _orderNum: _orderNum });

    let inventory = await Inventory.findOne({
      _itemName: extractedType,
      _location: location,
    });
    if (!inventory) {
      // Handle case where inventory item is not found
      return res.status(404).json({ message: "Inventory item not found" });
    }
    const currentInventoryQuantity = parseInt(inventory._quantity, 10);

    if (currentInventoryQuantity - _quantity < 0) {
      return res
        .status(400)
        .json({ message: "Negative inventory quantity is not allowed." });
    }
    // Deduct the order quantity from the inventory quantity
    inventory._quantity = currentInventoryQuantity - _quantity;

    // Save the updated inventory document
    await inventory.save();
    const phoneNumber = formatPhoneNumber(user._phone);
    const message =
      " Your order with order number of " +
      _orderNum +
      " has been placed " +
      extractedType +
      " - " +
      _quantity +
      " cub. mt.";

    client.messages
      .create({
        body: message,
        from: "+12295305097",
        to: phoneNumber,
      })
      .then((message) => console.log(`Message sent: ${message.sid}`))
      .catch((error) =>
        console.error(`Error sending message: ${error.message}`)
      );
    const id = await getNextNotifId();
    if (_status == "Pending") {
      let customerNotification = new Notification({
        _notifID: id,
        _date: _date,
        _name: _name,
        _title:
          "Your order with order number of " + _orderNum + " has been placed",
        _description: _materialType + " - " + _quantity + " cub. mt.",
      });
      await customerNotification.save();
      const mailOptions = {
        to: decryptedEmail,
        subject: "Your Order Update from JMIG Gravel and Sand",
        text: `Dear ${firstName} ${lastName},
        
        Order Number: ${id}
        Material Type: ${extractedType}
        Quantity: ${_quantity}
        Price: ${_price}

         We hope this email finds you well. We wanted to inform you that your recent order with JMIG Gravel and Sand is now available
         for viewing on our website. We understand the importance of staying informed about your order status, 
         and we're excited to provide you with a convenient way to track its progress.
    
         Thank you for choosing JMIG Gravel and Sand. We appreciate your business and look forward to serving you again in the future.
    
         Sincerely,
         JMIG Gravel and Sand Supply`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent successfully.");
        }
      });
    } else if (
      _status == "Available for pickup-PANDI" ||
      _status == "Available for pickup-MindanaoAve."
    ) {
      let customerNotification = new Notification({
        _notifID: id,
        _date: _date,
        _name: _name,
        _title: "You may now pick up your order!",
        _description: _materialType + " - " + _quantity + " cub. mt.",
      });
      await customerNotification.save();
    } else if (
      _status == "Arrived at Pandi" ||
      _status == "Arrived at MindanaoAve."
    ) {
      let customerNotification = new Notification({
        _notifID: id,
        _date: _date,
        _name: _name,
        _title: "Your order arrived at our inventory",
        _description: _materialType + " - " + _quantity + " cub. mt.",
      });
      await customerNotification.save();
    } else if (_status == "Fetch from quarry") {
      let customerNotification = new Notification({
        _notifID: id,
        _date: _date,
        _name: _name,
        _title: "Your order is being fetch from quary",
        _description: _materialType + " - " + _quantity + " cub. mt.",
      });
      await customerNotification.save();
    } else if (_status == "Cancelled") {
      let customerNotification = new Notification({
        _notifID: id,
        _date: _date,
        _name: _name,
        _title: "Order Cancelled",
        _description:
          "We regret to inform you that your order of " +
          _materialType +
          " - " +
          _quantity +
          " cub. mt. has been cancelled, if you have any questions feel free to contact our office from 8AM-5PM.",
      });

      await customerNotification.save();
    } else if (_status == "Delayed") {
      let customerNotification = new Notification({
        _notifID: id,
        _date: _date,
        _name: _name,
        _title: "Order Delayed",
        _description:
          "We regret to inform you that your order of " +
          _materialType +
          " - " +
          _quantity +
          " cub. mt. has experienced a delay in shipment, if you have any questions feel free to contact our office from 8AM-5PM.",
      });

      await customerNotification.save();
    }

    if (!order) {
      order = new Order({
        _orderNum: _orderNum,
        _name: _name,
        _materialType: _materialType,
        _date: _date,
        _status: _status,
        _price: _price,
        _quantity: _quantity,
        _orderDet: _orderDet,
      });
      await order.save();

      res.json({ message: "Order saved successfully" });
    } else {
      order._name = _name;
      order._materialType = _materialType;
      order._date = _date;
      order._status = _status;
      order._price = _price;
      order._quantity = _quantity;
      order._orderDet = _orderDet;
      await order.save();

      res.json({ message: "Order updated successfully" });
    }
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

router.post("/deleteOrder/:_orderNum", async (req, res) => {
  try {
    const id = req.params._orderNum;
    const removedRecord = await Order.findOneAndRemove({
      _orderNum: id,
    });

    if (removedRecord) {
      res.json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    console.error("Error deleting record", error);
    res
      .status(500)
      .json({ message: "Failed to delete the record", error: error.message });
  }
});
router.post("/deleteInventory/:_inventoryID", async (req, res) => {
  try {
    const id = req.params._inventoryID;
    const removedRecord = await Inventory.findOneAndRemove({
      _inventoryID: id,
    });

    if (removedRecord) {
      res.json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    console.error("Error deleting record", error);
    res
      .status(500)
      .json({ message: "Failed to delete the record", error: error.message });
  }
});

router.get("/get-customers", async (req, res) => {
  try {
    const customers = await CustomerUser.find();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});

router.get("/get-price", async (req, res) => {
  const { product } = req.query;

  try {
    const inventoryItem = await Listing.findOne({ _itemName: product }).select(
      "_price"
    );
    if (inventoryItem) {
      res.json({ _price: inventoryItem._price });
    } else {
      res.status(404).json({ error: "Price not found for the product" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch order data" });
  }
});

router.post("/delete-listing", async (req, res) => {
  try {
    const id = req.body._listingId;

    const removedRecord = await Listing.findOneAndRemove({
      _listingID: id,
    });

    if (removedRecord) {
      res.json({ message: "Record deleted successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    console.error("Error deleting record", error);
    res
      .status(500)
      .json({ message: "Failed to delete the record", error: error.message });
  }
});

module.exports = router;
