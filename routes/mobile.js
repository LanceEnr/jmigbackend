const express = require("express");
const router = express.Router();
const axios = require("axios");
const admin = require("firebase-admin");
const Counter = require("../models/counter");
const IncomingInventory = require("../models/incomingInventory");
const historyInventory = require("../models/historyInventory");
const Notification2 = require("../models/adminNotification");

router.get("/fetch-cargo", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/Cargo.json")
    .then((response) => {
      const cargoData = response.data;

      if (cargoData) {
        res.json(cargoData);
      } else {
        console.log('No data found in the "Cargo" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-documentCheck", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/Document Check.json"
    )
    .then((response) => {
      const documentData = response.data;

      if (documentData) {
        res.json(documentData);
      } else {
        console.log('No data found in the "Document Check" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-documentCheckSignatures", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/Document Check Signatures.json"
    )
    .then((response) => {
      const signatureData = response.data;

      if (signatureData) {
        res.json(signatureData);
      } else {
        console.log(
          'No data found in the "Document Signature Check" collection.'
        );
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-proof", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/ProofOfDelivery.json"
    )
    .then((response) => {
      const proofData = response.data;

      if (proofData) {
        res.json(proofData);
      } else {
        console.log('No data found in the "Proof of Delivery" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-schecklist", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/Safety Checklist.json"
    )
    .then((response) => {
      const checlistData = response.data;

      if (checlistData) {
        res.json(checlistData);
      } else {
        console.log('No data found in the "Safety Checklist" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-speed", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/SpeedTracker.json"
    )
    .then((response) => {
      const speedData = response.data;

      if (speedData) {
        res.json(speedData);
      } else {
        console.log('No data found in the "Speed" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-tripDash", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/Trip Dashboard.json"
    )
    .then((response) => {
      const tripData = response.data;

      if (tripData) {
        res.json(tripData);
      } else {
        console.log('No data found in the "Trip Dashboard" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-tripHistory", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/TripHistory.json")
    .then((response) => {
      const tripHistoryData = response.data;

      if (tripHistoryData) {
        res.json(tripHistoryData);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-add", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/TripHistory.json")
    .then((response) => {
      const tripHistoryData = response.data;
      if (tripHistoryData) {
        const filteredData = filterDataByStatus(tripHistoryData, "tobeadd");
        const cargoWeightArray = extractCargoAndWeight(filteredData);

        res.json(cargoWeightArray);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

function filterDataByStatus(data, status) {
  const filteredData = {};

  for (const uid in data) {
    for (const id in data[uid]) {
      const tripData = data[uid][id];

      if (tripData.status === status) {
        if (!filteredData[uid]) {
          filteredData[uid] = {};
        }
        filteredData[uid][id] = tripData;
      }
    }
  }

  return filteredData;
}
function extractCargoAndWeight(filteredData) {
  const cargoWeightArray = [];

  for (const uid in filteredData) {
    for (const id in filteredData[uid]) {
      const tripData = filteredData[uid][id];

      const cargo = tripData.cargo;
      const weight = tripData.weight;
      const destination = tripData.destination;

      cargoWeightArray.push([cargo, weight, destination, uid, id]);
    }
  }

  return cargoWeightArray;
}
router.get("/fetch-SpeedRecord", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/SpeedRecord.json")
    .then((response) => {
      const speedData = response.data;

      if (speedData) {
        res.json(speedData);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-ProofRecords", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/ProofRecords.json"
    )
    .then((response) => {
      const proofData = response.data;

      if (proofData) {
        res.json(proofData);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-documentCheckRecord", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/DocumentCheckRecord.json"
    )
    .then((response) => {
      const documentData = response.data;

      if (documentData) {
        res.json(documentData);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-schecklistrecord", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/SafetyChecklistRecord.json"
    )
    .then((response) => {
      const schecklistData = response.data;

      if (schecklistData) {
        res.json(schecklistData);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-documentCheckRecord/:id/:driver", async (req, res) => {
  try {
    const { id, driver } = req.params;

    // Fetch the driver data from Firebase
    const driverResponse = await axios.get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement.json"
    );

    const driverData = driverResponse.data;
    if (driverData) {
      // Find the driver with the specified name
      const matchingDriver = Object.values(driverData).find(
        (driverObj) => driverObj.driverName === driver
      );

      if (matchingDriver) {
        const uid = matchingDriver.UID;

        const firebaseUrl = `https://gravasend-965f7-default-rtdb.firebaseio.com/DocumentCheckRecord/${uid}/${id}.json`;

        const response = await axios.get(firebaseUrl);

        if (response.data) {
          res.json(response.data);
        } else {
          res.status(404).json({ error: "Data not found" });
        }
      } else {
        res.status(404).json({ error: "Driver not found" });
      }
    } else {
      res.status(404).json({ error: "No driver data available" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetch-sCheckRecord/:id/:driver", async (req, res) => {
  try {
    const { id, driver } = req.params;
    // Fetch the driver data from Firebase
    const driverResponse = await axios.get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement.json"
    );

    const driverData = driverResponse.data;
    if (driverData) {
      // Find the driver with the specified name
      const matchingDriver = Object.values(driverData).find(
        (driverObj) => driverObj.driverName === driver
      );

      if (matchingDriver) {
        const uid = matchingDriver.UID;

        const firebaseUrl = `https://gravasend-965f7-default-rtdb.firebaseio.com/SafetyChecklistRecord/${uid}/${id}.json`;

        const response = await axios.get(firebaseUrl);

        if (response.data) {
          res.json(response.data);
        } else {
          res.status(404).json({ error: "Data not found" });
        }
      } else {
        res.status(404).json({ error: "Driver not found" });
      }
    } else {
      res.status(404).json({ error: "No driver data available" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetch-signaturerecord/:id/:driver", async (req, res) => {
  try {
    const { id, driver } = req.params;

    // Fetch the driver data from Firebase
    const driverResponse = await axios.get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement.json"
    );

    const driverData = driverResponse.data;
    if (driverData) {
      // Find the driver with the specified name
      const matchingDriver = Object.values(driverData).find(
        (driverObj) => driverObj.driverName === driver
      );

      if (matchingDriver) {
        const uid = matchingDriver.UID;
        const firebaseUrl = `https://gravasend-965f7-default-rtdb.firebaseio.com/DocumentCheckSignaturesRecord/${uid}/${id}.json`;

        const response = await axios.get(firebaseUrl);

        if (response.data) {
          res.json(response.data);
        } else {
          res.status(404).json({ error: "Data not found" });
        }
      } else {
        res.status(404).json({ error: "Driver not found" });
      }
    } else {
      res.status(404).json({ error: "No driver data available" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/fetch-inspectionRecords", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/inspectionRecords.json"
    )
    .then((response) => {
      const insectionRecordsData = response.data;

      if (insectionRecordsData) {
        res.json(insectionRecordsData);
      } else {
        console.log('No data found in the "Inspection Records" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-location", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/locations.json")
    .then((response) => {
      const locationData = response.data;

      if (locationData) {
        res.json(locationData);
      } else {
        console.log('No data found in the "Location" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-maintenanceHistory", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/maintenanceHistory.json"
    )
    .then((response) => {
      const maintenaceHistoryData = response.data;

      if (maintenaceHistoryData) {
        res.json(maintenaceHistoryData);
      } else {
        console.log('No data found in the "Maintenance History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-maintenanceReminders", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/maintenanceReminders.json"
    )
    .then((response) => {
      const maintenanceRemindersData = response.data;

      if (maintenanceRemindersData) {
        res.json(maintenanceRemindersData);
      } else {
        console.log('No data found in the "Maintenance Reminders" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-maintenanceReminders2/:uid/:id", (req, res) => {
  const { uid, id } = req.params;

  axios
    .get(
      `https://gravasend-965f7-default-rtdb.firebaseio.com/maintenanceReminders/${uid}/${id}.json`
    )
    .then((response) => {
      const maintenanceRemindersData = response.data;

      if (maintenanceRemindersData) {
        res.json(maintenanceRemindersData);
      } else {
        console.log('No data found in the "Maintenance Reminders" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-mileage-plate/:plate", async (req, res) => {
  try {
    const { plate } = req.params;

    // Reference to the trucks node in your Firebase Realtime Database
    const trucksRef = admin.database().ref("trucks");

    // Query the database to find the truck with the specified plate number
    const querySnapshot = await trucksRef
      .orderByChild("plateNo")
      .equalTo(plate)
      .once("value");

    // Check if any matching truck is found
    if (querySnapshot.exists()) {
      // Since there can be multiple results, loop through the results
      let mileage;
      querySnapshot.forEach((childSnapshot) => {
        const truckData = childSnapshot.val();
        if (truckData && truckData.mileage) {
          mileage = truckData.mileage;
        }
      });

      if (mileage) {
        res.json({ success: true, mileage });
      } else {
        res.status(404).json({
          success: false,
          message: "Mileage not found for the specified plate number",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Truck not found for the specified plate number",
      });
    }
  } catch (error) {
    console.error("Error fetching mileage:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.get("/fetch-maintenanceHistory2/:uid/:id", (req, res) => {
  const { uid, id } = req.params;

  axios
    .get(
      `https://gravasend-965f7-default-rtdb.firebaseio.com/maintenanceHistory/${uid}/${id}.json`
    )
    .then((response) => {
      const maintenanceRemindersData = response.data;

      if (maintenanceRemindersData) {
        res.json(maintenanceRemindersData);
      } else {
        console.log('No data found in the "Maintenance Reminders" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-inspections2/:uid/:id", (req, res) => {
  const { uid, id } = req.params;

  axios
    .get(
      `https://gravasend-965f7-default-rtdb.firebaseio.com/upcomingInspections/${uid}/${id}.json`
    )
    .then((response) => {
      const inspectionData = response.data;

      if (inspectionData) {
        res.json(inspectionData);
      } else {
        console.log('No data found in the "Maintenance Reminders" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-trucks", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/trucks.json")
    .then((response) => {
      const trucksData = response.data;

      if (trucksData) {
        res.json(trucksData);
      } else {
        console.log('No data found in the "Trucks" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-trucks2/:id", (req, res) => {
  const { id } = req.params;

  axios
    .get(
      `https://gravasend-965f7-default-rtdb.firebaseio.com/trucks/${id}.json`
    )
    .then((response) => {
      const truckData = response.data;

      if (truckData) {
        res.json(truckData);
      } else {
        console.log(`No data found for truck with ID ${id}.`);
        res.status(404).json({ message: "Truck not found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-fleet-available", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/trucks.json")
    .then((response) => {
      const driverData = response.data;

      if (driverData) {
        const unassignedDrivers = Object.values(driverData).filter(
          (driver) => driver.status === "available"
        );

        res.json(unassignedDrivers);
      } else {
        console.log('No data found in the "Truck" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-upcomingInspections", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/upcomingInspections.json"
    )
    .then((response) => {
      const upcomingInspectionsData = response.data;

      if (upcomingInspectionsData) {
        res.json(upcomingInspectionsData);
      } else {
        console.log('No data found in the "Upcoming Inspections" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-driver", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement.json"
    )
    .then((response) => {
      const driverData = response.data;

      if (driverData) {
        res.json(driverData);
      } else {
        console.log('No data found in the "Driver Management" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-driver2/:id", (req, res) => {
  const { id } = req.params;

  axios
    .get(
      `https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement/${id}.json`
    )
    .then((response) => {
      const driverData = response.data;

      if (driverData) {
        res.json(driverData);
      } else {
        console.log(`No data found for truck with ID ${id}.`);
        res.status(404).json({ message: "Truck not found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-DriverName/:uid", (req, res) => {
  const { uid } = req.params;

  axios
    .get(
      `https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement/${uid}.json`
    )
    .then((response) => {
      const driverData = response.data;

      if (driverData && driverData.driverName) {
        res.json({ driverName: driverData.driverName });
      } else {
        console.log(`No data found for truck with ID ${uid}.`);
        res.status(404).json({ message: "Truck not found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-driver-available", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/DriverManagement.json"
    )
    .then((response) => {
      const driverData = response.data;

      if (driverData) {
        const unassignedDrivers = Object.values(driverData).filter(
          (driver) => driver.status === "unassigned"
        );
        res.json(unassignedDrivers);
      } else {
        console.log('No data found in the "Driver Management" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
const getNextDriverNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return counter.value;
  } catch (err) {
    console.error("Error getting the next inventory number:", err);
    throw err;
  }
};
router.get("/generateDriverID", async (req, res) => {
  try {
    const id = await getNextDriverNum();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
});
router.post("/check-email/:email", async (req, res) => {
  const email = req.params;
  console.log("email: " + email);
  try {
    const user = await admin.auth().getUserByEmail(email);

    if (user) {
      res.status(200).json({ message: "Driver found" });
      console.log("found");
    } else {
      console.log("User does not exist");
      res.status(404).json({ message: "Driver not yet registered" });
    }
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/addDriver", async (req, res) => {
  const email = req.body.email;
  const driverData = req.body;
  driverData.performance = 1.0;

  // Add the status field and set it to "unassigned"
  driverData.status = "unassigned";

  try {
    const user = await admin.auth().getUserByEmail(email);

    if (user) {
      const uid = user.uid;

      const db = admin.database();
      const ref = db.ref(`DriverManagement/${uid}`);
      await ref.set(driverData);

      res.status(200).json({ message: "Driver added successfully" });
    } else {
      console.log("User does not exist");
      //res.status(404).json({ message: "User does not exist" });
    }
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/deleteDriverRecord", async (req, res) => {
  const _driverID = req.body._driverID;
  try {
    const db = admin.database();
    const driverRef = db.ref(`DriverManagement/${_driverID}`);

    await driverRef.remove();

    res.status(200).json({ message: "Driver record deleted successfully" });
  } catch (error) {
    console.error("Firebase delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/addTruck", async (req, res) => {
  const truckData = req.body;
  const mileageString = truckData.mileage;
  const mileage = parseInt(mileageString, 10);
  truckData.mileage = mileage;
  const driverName = truckData.driverName;
  try {
    const db = admin.database();
    const driversRef = db.ref("DriverManagement");

    driversRef.once("value", (snapshot) => {
      let uid = null;

      snapshot.forEach((childSnapshot) => {
        const driverData = childSnapshot.val();

        if (driverData.driverName === driverName) {
          uid = childSnapshot.key;

          driverData.status = "assigned";
          driverData.UID = uid;
          const driverRef = db.ref(`DriverManagement/${uid}`);
          driverRef.set(driverData, (error) => {
            if (error) {
              console.error("Firebase set error:", error);
              res.status(500).json({ message: "Internal server error" });
            }
          });
        }
      });

      if (uid) {
        truckData.UID = uid;

        const ref = db.ref(`trucks/${uid}`);
        ref.set(truckData, (error) => {
          if (error) {
            console.error("Firebase set error:", error);
            res.status(500).json({ message: "Internal server error" });
          } else {
            res.status(200).json({ message: "Truck added successfully" });
          }
        });
      } else {
        res.status(400).json({ message: "Driver not found" });
      }
    });
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/editTruck", async (req, res) => {
  const truckData = req.body;
  console.log(truckData);
  const uid = truckData.id;
  const driverName = truckData.driverName;
  const current = truckData.current;
  try {
    const db = admin.database();
    const driversRef = db.ref("DriverManagement");
    const truckRef = db.ref("trucks");

    if (driverName == current) {
      truckRef.child(truckData.id).set(truckData, (error) => {
        if (error) {
          console.error("Firebase set error:", error);
          res.status(500).json({ message: "Internal server error" });
        } else {
          res.status(200).json({ message: "Truck updated successfully" });
        }
      });
    } else {
      const db = admin.database();
      const truckRef = db.ref(`trucks/${uid}`);
      await truckRef.remove();

      const driversRef = db.ref("DriverManagement");

      driversRef.once("value", (snapshot) => {
        let uid = null;

        snapshot.forEach((childSnapshot) => {
          const driverData = childSnapshot.val();

          if (driverData.driverName === driverName) {
            uid = childSnapshot.key;
            const truckRef = db.ref(`trucks`);
            truckRef.child(uid).set(truckData, (error) => {
              if (error) {
                console.error("Firebase set error:", error);
                res.status(500).json({ message: "Internal server error" });
              } else {
                res.status(200).json({ message: "Truck updated successfully" });
              }
            });
            driverData.status = "assigned";
            driverData.UID = uid;
            const driverRef = db.ref(`DriverManagement/${driverData.UID}`);
            driverRef.set(driverData, (error) => {
              if (error) {
                console.error("Firebase set error:", error);
                res.status(500).json({ message: "Internal server error" });
              }
            });
          }
          if (driverData.driverName === current) {
            uid = childSnapshot.key;
            driverData.status = "unassigned";
            driverData.UID = uid;
            console.log(driverData.UID + " 2");
            console.log(driverData.status + " 1");
            const driverRef = db.ref(`DriverManagement/${driverData.UID}`);
            driverRef.set(driverData, (error) => {
              if (error) {
                console.error("Firebase set error:", error);
                res.status(500).json({ message: "Internal server error" });
              }
            });
          }
        });
      });
    }
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/deleteTruckRecord", async (req, res) => {
  const _truckID = req.body._truckID;
  try {
    const db = admin.database();
    const truckRef = db.ref(`trucks/${_truckID}`);

    await truckRef.remove();

    res.status(200).json({ message: "Driver record deleted successfully" });
  } catch (error) {
    console.error("Firebase delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const getNextJobNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "id_delivery" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return counter.value;
  } catch (err) {
    console.error("Error getting the next fleet number:", err);
    throw err;
  }
};
const getNextIncoming = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_incomingId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 10000000;
    const orderIdWithOffset = counter.value + offset;
    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next fleet number:", err);
    throw err;
  }
};
router.post("/addJob", async (req, res) => {
  const jobData = req.body;
  const driverName = jobData.driverName;
  const id = await getNextIncoming();

  try {
    const db = admin.database();
    const driversRef = db.ref("trucks");
    const incoming = new IncomingInventory({
      _inventoryID: id,
      _name: jobData.driverName,
      _materialType: jobData.cargo,
      _date: jobData.dateTime,
      _quantity: jobData.weight,
      _location: jobData.destination,
    });
    await incoming.save();
    driversRef.once("value", (snapshot) => {
      let uid = null;

      snapshot.forEach((childSnapshot) => {
        const driverData = childSnapshot.val();

        if (driverData.driverName === driverName) {
          uid = childSnapshot.key;

          // Update the status of the truck to "unavailable"
          db.ref(`trucks/${uid}`).update(
            { status: "unavailable" },
            (statusUpdateError) => {
              if (statusUpdateError) {
                console.error(
                  "Firebase status update error:",
                  statusUpdateError
                );
                res.status(500).json({ message: "Internal server error" });
              } else {
                // Proceed to add the job data
                jobData.UID = uid;
                jobData.status = "OnGoing";
                const ref = db.ref(`Trip Dashboard/${uid}`);
                ref.set(jobData, (jobDataError) => {
                  if (jobDataError) {
                    console.error("Firebase set error:", jobDataError);
                    res.status(500).json({ message: "Internal server error" });
                  } else {
                    res.status(200).json({ message: "Job added successfully" });
                  }
                });
              }
            }
          );
        }
      });

      if (!uid) {
        res.status(400).json({ message: "Driver not found" });
      }
    });
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/HoldStatus", async (req, res) => {
  const holdData = req.body;
  console.log(holdData);
});

router.get("/fetch-upcominginspection", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/upcomingInspections.json"
    )
    .then((response) => {
      const upcomingdata = response.data;

      if (upcomingdata) {
        res.json(upcomingdata);
      } else {
        console.log('No data found in the "Upcoming Inspection" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-inspectionrecords", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/inspectionRecords.json"
    )
    .then((response) => {
      const inspectionrecordsdata = response.data;

      if (inspectionrecordsdata) {
        res.json(inspectionrecordsdata);
      } else {
        console.log('No data found in the "Inspection Records" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-maintenance", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/maintenanceReminders.json"
    )
    .then((response) => {
      const maintenancedata = response.data;

      if (maintenancedata) {
        res.json(maintenancedata);
      } else {
        console.log('No data found in the "Maintenance" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-maintenance-overdue", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/maintenanceReminders.json"
    )
    .then((response) => {
      const maintenanceData = response.data;

      if (maintenanceData) {
        // Filter maintenance data with a status of "overdue"
        const overdueMaintenanceData = Object.values(maintenanceData).filter(
          (maintenance) => maintenance.status === "overdue"
        );

        // Check if there is any overdue maintenance data
        if (overdueMaintenanceData.length > 0) {
          res.json(overdueMaintenanceData);
        } else {
          console.log(
            'No "overdue" status found in the "Maintenance" collection.'
          );
          res.status(404).json({ message: "No overdue maintenance found" });
        }
      } else {
        console.log('No data found in the "Maintenance" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-inspection-overdue", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/upcomingInspections.json"
    )
    .then((response) => {
      const maintenanceData = response.data;

      if (maintenanceData) {
        // Filter maintenance data with a status of "overdue"
        const overdueMaintenanceData = Object.values(maintenanceData).filter(
          (maintenance) => maintenance.status === "overdue"
        );

        // Check if there is any overdue maintenance data
        if (overdueMaintenanceData.length > 0) {
          res.json(overdueMaintenanceData);
        } else {
          console.log(
            'No "overdue" status found in the "Maintenance" collection.'
          );
          res.status(404).json({ message: "No overdue maintenance found" });
        }
      } else {
        console.log('No data found in the "Maintenance" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

const getNextFleetNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_fleetId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 61000000;
    const orderIdWithOffset = counter.value + offset;
    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next fleet number:", err);
    throw err;
  }
};
router.get("/generateFleetId", async (req, res) => {
  try {
    const id = await getNextFleetNum();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
});

const getNextMaintenanceNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_maintenanceID" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 21000000;
    const orderIdWithOffset = counter.value + offset;
    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next maintenance number:", err);
    throw err;
  }
};
const getNextInspectionNum = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "_inspectionID" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const offset = 21000000;
    const orderIdWithOffset = counter.value + offset;
    return orderIdWithOffset;
  } catch (err) {
    console.error("Error getting the next maintenance number:", err);
    throw err;
  }
};
router.get("/generateMaintenanceId", async (req, res) => {
  try {
    const id = await getNextMaintenanceNum();
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
});

router.get("/fetch-job-orders", (req, res) => {
  axios
    .get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/Trip Dashboard.json"
    )
    .then((response) => {
      const jobData = response.data;

      if (jobData) {
        res.json(jobData);
      } else {
        console.log('No data found in the "Trip Dashboard" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});
router.get("/fetch-job-records", (req, res) => {
  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/TripHistory.json")
    .then((response) => {
      const jobData = response.data;

      if (jobData) {
        res.json(jobData);
      } else {
        console.log('No data found in the "Trip History" collection.');
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

const getMileageFromPlate = async (plateNo) => {
  try {
    const response = await axios.get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/trucks.json"
    );
    const truckData = response.data;

    if (truckData) {
      const uidArray = Object.keys(truckData);
      for (const uid of uidArray) {
        const truck = truckData[uid];
        if (truck.plateNo === plateNo) {
          if ("mileage" in truck) {
            return truck.mileage;
          } else {
            console.log(
              `Mileage property not found in the truck object with plateNo '${plateNo}'`
            );
            return null;
          }
        }
      }
      console.log(`Truck with plateNo '${plateNo}' not found.`);
      return null;
    } else {
      console.log('No data found in the "Truck" collection.');
      return null;
    }
  } catch (error) {
    console.error("Firebase connection error:", error);
    return null;
  }
};
async function getUIDFromPlate(plateNo) {
  try {
    const response = await axios.get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/trucks.json"
    );
    const truckData = response.data;

    if (truckData) {
      const uidArray = Object.keys(truckData);
      for (const uid of uidArray) {
        const truck = truckData[uid];
        if (truck.plateNo === plateNo) {
          if ("plateNo" in truck) {
            return uid;
          } else {
            console.log(
              `UID property not found in the truck object with plateNo '${plateNo}'`
            );
            return null;
          }
        }
      }
      console.log(`Truck with UID '${plateNo}' not found.`);
      return null;
    } else {
      console.log('No data found in the "Truck" collection.');
      return null;
    }
  } catch (error) {
    console.error("Firebase connection error:", error);
    return null;
  }
}

router.post("/addMaintenance", async (req, res) => {
  const maintenanceData = req.body;
  const id = await getNextMaintenanceNum();
  maintenanceData.id = id;

  try {
    const plateNo = maintenanceData.plateNo;
    //const mileage = await getMileageFromPlate(plateNo);
    const uid = await getUIDFromPlate(plateNo);
    const frequency = maintenanceData.frequency;
    //const nextDueMileage = parseInt(startmileage) + parseInt(frequency);

    maintenanceData.uid = uid;

    const db = admin.database();
    const refReminders = db.ref(
      `maintenanceReminders/${maintenanceData.uid}/${maintenanceData.id}`
    );

    // Check if status is "Completed"
    if (maintenanceData.status === "Completed") {
      // Move the record to maintenanceHistory
      const refHistory = db.ref(
        `maintenanceHistory/${maintenanceData.uid}/${maintenanceData.id}`
      );
      await refHistory.set(maintenanceData);
    } else {
      // Add the record to maintenanceReminders
      await refReminders.set(maintenanceData);
    }

    res
      .status(200)
      .json({ message: "Maintenance record updated successfully" });
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/editMaintenance", async (req, res) => {
  const maintenanceData = req.body;

  try {
    const plateNo = maintenanceData.plateNo;
    const mileage = await getMileageFromPlate(plateNo);
    //const uid = await getUIDFromPlate(plateNo);

    if (mileage !== null) {
      const frequency = maintenanceData.frequency;
      const nextDueMileage = parseInt(mileage) + parseInt(frequency);

      maintenanceData.mileage = parseInt(mileage);

      const db = admin.database();
      const refReminders = db.ref(
        `maintenanceReminders/${maintenanceData.uid}/${maintenanceData.id}`
      );

      // Check if status is "Completed"
      if (maintenanceData.status === "Completed") {
        // Move the record to maintenanceHistory
        const refHistory = db.ref(
          `maintenanceHistory/${maintenanceData.uid}/${maintenanceData.id}`
        );
        await refHistory.set(maintenanceData);

        // Remove the record from maintenanceReminders
        await refReminders.remove();
      } else {
        // Add the record to maintenanceReminders
        await refReminders.set(maintenanceData);
      }

      res
        .status(200)
        .json({ message: "Maintenance record updated successfully" });
    } else {
      res.status(404).json({ message: "Plate number not found" });
    }
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/deleteMaintenanceRecord", async (req, res) => {
  const _maintenanceId = req.body._maintenanceId;
  const uid = req.body.uid;
  try {
    const db = admin.database();
    const maintenanceRef = db.ref(
      `maintenanceReminders/${uid}/${_maintenanceId}`
    );

    await maintenanceRef.remove();

    res
      .status(200)
      .json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Firebase delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/fetch-mileage", (req, res) => {
  const plateNo = req.query.plateNo;

  axios
    .get("https://gravasend-965f7-default-rtdb.firebaseio.com/trucks.json")
    .then((response) => {
      const truckData = response.data;

      if (truckData && truckData[plateNo]) {
        const mileage = truckData[plateNo].mileage;
        res.json({ plateNo, mileage });
      } else {
        console.log(`No mileage data found for plate number: ${plateNo}`);
        res.status(404).json({ message: "No data found" });
      }
    })
    .catch((error) => {
      console.error("Firebase connection error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/fetch-documentCheck/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUrl = `https://gravasend-965f7-default-rtdb.firebaseio.com/Document%20Check/${id}.json`;

    const response = await axios.get(firebaseUrl);

    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/fetch-signature/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUrl = `https://gravasend-965f7-default-rtdb.firebaseio.com/Document%20Check%20Signatures/${id}.json`;

    const response = await axios.get(firebaseUrl);

    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/addInspection", async (req, res) => {
  const inspectionData = req.body;
  const id = await getNextMaintenanceNum();
  inspectionData.actionId = id;

  try {
    const plateNo = inspectionData.plateNo;
    const uid = await getUIDFromPlate(plateNo);
    inspectionData.uid = uid;

    const db = admin.database();
    const actionId = inspectionData.actionId;

    const verdict = inspectionData.verdict;

    if (verdict === "Pass" || verdict === "Failed") {
      const recordsRef = db.ref(`inspectionRecords/${uid}/${actionId}`);
      await recordsRef.set({ ...inspectionData, verdict });

      const upcomingRef = db.ref(`upcomingInspections/${uid}/${actionId}`);
      const snapshot = await upcomingRef.once("value");
      if (snapshot.val()) {
        await upcomingRef.remove();
      }

      res
        .status(200)
        .json({ message: "Inspection added to records successfully" });
    } else {
      const ref = db.ref(`upcomingInspections/${uid}/${actionId}`);
      await ref.set(inspectionData);

      res.status(200).json({
        message: "Inspection updated successfully",
      });
    }
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/editInspection", async (req, res) => {
  const inspectionData = req.body;
  const uid = inspectionData.uid;
  const id = inspectionData.id;
  const verdict = inspectionData.verdict;
  const db = admin.database();
  try {
    if (verdict === "Passed" || verdict === "Failed") {
      const recordsRef = db.ref(`inspectionRecords/${uid}/${id}`);
      await recordsRef.set({ ...inspectionData, verdict });

      const upcomingRef = db.ref(`upcomingInspections/${uid}/${id}`);
      const snapshot = await upcomingRef.once("value");
      if (snapshot.val()) {
        await upcomingRef.remove();
      }

      res
        .status(200)
        .json({ message: "Inspection added to records successfully" });
    } else {
      const ref = db.ref(`upcomingInspections/${uid}/${actionId}`);
      await ref.set(inspectionData);

      res.status(200).json({
        message: "Inspection updated successfully",
      });
    }
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/editDriver", async (req, res) => {
  const driverData = req.body;
  const id = driverData.id;
  const db = admin.database();
  try {
    const ref = db.ref(`DriverManagement/${id}`);
    await ref.set(driverData);

    res.status(200).json({
      message: "Driver updated successfully",
    });
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/deleteInspection", async (req, res) => {
  const _inspectionId = req.body.id;
  const uid = req.body.uid;

  try {
    const db = admin.database();
    const maintenanceRef = db.ref(
      `upcomingInspections/${uid}/${_inspectionId}`
    );

    await maintenanceRef.remove();

    res
      .status(200)
      .json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Firebase delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/deleteJob", async (req, res) => {
  const jobData = req.body;
  const uid = req.body.UID;
  try {
    const db = admin.database();
    const maintenanceRef = db.ref(`Trip Dashboard/${uid}`);

    await maintenanceRef.remove();

    res
      .status(200)
      .json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Firebase delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/fetch-safetychecklist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUrl = `https://gravasend-965f7-default-rtdb.firebaseio.com/Safety%20Checklist/${id}.json`;

    const response = await axios.get(firebaseUrl);

    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update-maintenanceRecords", async (req, res) => {
  const maintenanceData = req.body;

  try {
    const plateNo = maintenanceData.plateNo;

    const db = admin.database();
    const ref = db.ref(
      `maintenanceHistory/${maintenanceData.uid}/${maintenanceData.id}`
    );

    // Use update to append new fields without deleting existing ones
    await ref.update({
      provider: maintenanceData.provider,
      cost: maintenanceData.cost,
    });

    res
      .status(200)
      .json({ message: "Maintenance record updated successfully" });
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update-TripHistory", async (req, res) => {
  const data = req.body;
  console.log(data);
  for (const stockData of data) {
    const uid = stockData[3];
    const id = stockData[4];

    try {
      const db = admin.database();
      const ref = db.ref(`TripHistory/${uid}/${id}`);

      await ref.update({
        status: "added",
      });

      res.status(200).json({ message: "Inventory updated successfully" });
    } catch (error) {
      console.error("Firebase Authentication error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

router.post("/deleteMaintenanceRecord2", async (req, res) => {
  const _maintenanceId = req.body._maintenanceId;

  try {
    const db = admin.database();
    const maintenanceRef = db.ref(`maintenanceHistory/${_maintenanceId}`);

    await maintenanceRef.remove();

    res
      .status(200)
      .json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    console.error("Firebase delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/incomingInventory", async (req, res) => {
  try {
    const incomingInventoryData = await IncomingInventory.find();
    const tripHistoryData = await axios.get(
      "https://gravasend-965f7-default-rtdb.firebaseio.com/TripHistory.json"
    );

    const incomingInventoryFiltered = incomingInventoryData.filter((item) => {
      const incomingInventoryDate = new Date(item._date).toLocaleDateString();

      // Check if the date exists in TripHistory data
      const isDateExists =
        tripHistoryData.data &&
        hasDateInTripHistory(tripHistoryData.data, incomingInventoryDate);

      return !isDateExists;
    });
    const savePromises = incomingInventoryData
      .filter((item) => {
        const incomingInventoryDate = new Date(item._date).toLocaleDateString();
        return hasDateInTripHistory(
          tripHistoryData.data,
          incomingInventoryDate
        );
      })
      .map(async (item) => {
        const newItem = new historyInventory({ ...item._doc, uid: item._id });
        await newItem.save();
      });

    // Wait for all items to be saved to historyInventory
    await Promise.all(savePromises);

    // Delete items from incoming inventory whose dates exist in TripHistory
    const deletePromises = incomingInventoryData
      .filter((item) => {
        const incomingInventoryDate = new Date(item._date).toLocaleDateString();
        return hasDateInTripHistory(
          tripHistoryData.data,
          incomingInventoryDate
        );
      })
      .map(async (item) => await IncomingInventory.findByIdAndDelete(item._id));

    await Promise.all(deletePromises);

    res.json(incomingInventoryFiltered);
  } catch (error) {
    console.error("Error fetching or deleting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function hasDateInTripHistory(tripHistoryData, date) {
  return tripHistoryData && tripHistoryData[date];
}

function hasDateInTripHistory(tripHistoryData, dateToCheck) {
  for (const uid in tripHistoryData) {
    if (tripHistoryData.hasOwnProperty(uid)) {
      const idData = tripHistoryData[uid];
      for (const id in idData) {
        if (idData.hasOwnProperty(id)) {
          const tripDate = new Date(idData[id].dateTime).toLocaleDateString();
          if (tripDate === dateToCheck) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

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
router.post("/maintenance-notif", async (req, res) => {
  const {
    status,
    plateNo,
    service,
    currentMileage,
    date,
    uidMaintenance,
    idMaintenance,
  } = req.body;
  console.log(status);
  if (status == "Pending") {
    const id = await getNextNotifId();
    let adminNotification = new Notification2({
      _notifID: id,
      _date: date,
      _name: plateNo,
      _title: "Truck Maintenance: " + plateNo,
      _description: `Maintenance (${service}) due for ${plateNo}. Mileage: ${currentMileage}`,
    });
    await adminNotification.save();
    const db = admin.database();
    const refReminders = db.ref(
      `maintenanceReminders/${uidMaintenance}/${idMaintenance}`
    );
    const newStatus = "overdue";
    refReminders
      .update({
        status: newStatus,
      })
      .then(() => {
        console.log(
          `Status updated successfully for maintenance with ID ${idMaintenance}`
        );
      })
      .catch((error) => {
        console.error(
          `Error updating status for maintenance with ID ${idMaintenance}:`,
          error
        );
      });
  } else {
  }
});
router.post("/inspection-notif", async (req, res) => {
  const { plateNo, uid, id, inspectionType, verdict, date } = req.body;

  const id2 = await getNextNotifId();
  let adminNotification = new Notification2({
    _notifID: id,
    _date: date,
    _name: plateNo,
    _title: "Truck Inspection: " + plateNo,
    _description: `Inspection (${inspectionType}) for ${plateNo}. (${verdict})`,
  });
  await adminNotification.save();
  const db = admin.database();
  const refReminders = db.ref(`upcomingInspections/${uid}/${id}`);

  refReminders
    .update({
      verdict: verdict,
    })
    .then(() => {
      console.log(`Status updated successfully for inspection with ID ${id}`);
    })
    .catch((error) => {
      console.error(
        `Error updating status for inspection with ID ${id}:`,
        error
      );
    });
});

router.post("/inspection-notif2", async (req, res) => {
  const { plateNo, uid, id, inspectionType, verdict, date, duration } =
    req.body;

  const id2 = await getNextNotifId();
  let adminNotification = new Notification2({
    _notifID: id,
    _date: date,
    _name: plateNo,
    _title: "Truck Inspection: " + plateNo,
    _description: `Inspection (${inspectionType}) for ${plateNo} in ${duration}`,
  });
  await adminNotification.save();
  const db = admin.database();
  const refReminders = db.ref(`upcomingInspections/${uid}/${id}`);

  refReminders
    .update({
      verdict: verdict,
    })
    .then(() => {
      console.log(`Status updated successfully for inspection with ID ${id}`);
    })
    .catch((error) => {
      console.error(
        `Error updating status for inspection with ID ${id}:`,
        error
      );
    });
});
router.get("/fetch-adminNotifications", async (req, res) => {
  try {
    // Fetch data from MongoDB using Mongoose
    const notif = await Notification2.find().sort({
      _notifID: -1,
    });

    // Fetch data from Firebase Realtime Database
    const db = admin.database();
    const refReminders = db.ref("Notifications");

    const snapshot = await refReminders.once("value");
    const data = snapshot.val();

    // Transform the data into the desired format
    const transformedData = [];

    if (data) {
      for (const uid in data) {
        if (data.hasOwnProperty(uid)) {
          const userData = data[uid];

          for (const id in userData) {
            if (userData.hasOwnProperty(id)) {
              const maintenanceData = userData[id];

              if (maintenanceData._status === "unviewed") {
                const mappedData = {
                  _notifID: id,
                  _date: maintenanceData._date || "",
                  _title: maintenanceData._title || "",
                  _description: maintenanceData._description || "",
                  _name: maintenanceData._title || "",
                };

                transformedData.push(mappedData);
              }
            }
          }
        }
      }
    }

    const combinedData = [...notif, ...transformedData];

    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch notification data" });
  }
});

module.exports = router;
