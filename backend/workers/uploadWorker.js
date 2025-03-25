import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import readline from "readline";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
//schemas
import Agent from "../models/Agent.js";
import UserAccount from "../models/UserAccount.js";
import PolicyCategory from "../models/PolicyCategory.js";
import PolicyCarrier from "../models/PolicyCarrier.js";
import PolicyInfo from "../models/PolicyInfo.js";
import User from "../models/User.js";
import moment from "moment";

const processFile = async () => {
  await connectDB(); // Ensure DB is connected before processing

  const readStream = fs.createReadStream(workerData.filePath);
  const rl = readline.createInterface({ input: readStream });

  let headers = [];

  let agentColumnIndex = -1;
  const agents = [];

  let userAccountColumnIndex = -1;
  const userAccounts = [];

  let categoryNameIndex = -1;
  const categoryNames = [];

  let companyNameIndex = -1;
  const companyNames = [];

  let userIndexMap = {};
  const users = [];

  let policyInfoIndexMap = {};
  const policyinfoarray = [];

  rl.on("line", (line) => {
    const row = line.split(",").map((cell) => cell.trim());

    if (headers.length === 0) {
      //  headers = row.map((header) => header.toLowerCase());

      headers = row.map((header) => header);

      agentColumnIndex = headers.indexOf("agent");
      userAccountColumnIndex = headers.indexOf("account_name");
      categoryNameIndex = headers.indexOf("category_name");
      companyNameIndex = headers.indexOf("company_name");
      //  firstnameIndex = headers.indexOf("city");

      //console.log(firstnameIndex);

      //user
      // Map header indexes
      userIndexMap = {
        firstName: headers.indexOf("firstname"),
        dob: headers.indexOf("dob"),
        address: headers.indexOf("address"),
        phone: headers.indexOf("phone"),
        state: headers.indexOf("state"),
        zipCode: headers.indexOf("zip"),
        email: headers.indexOf("email"),
        gender: headers.indexOf("gender"),
        userType: headers.indexOf("userType"),
      };

      policyInfoIndexMap = {
        policyNumber: headers.indexOf("policy_number"),
        startDate: headers.indexOf("policy_start_date"),
        endDate: headers.indexOf("policy_end_date"),
        firstName: headers.indexOf("firstname"),
      };

      // console.log(policyInfoIndexMap)

      if (agentColumnIndex === -1) {
        parentPort.postMessage({ error: "Agent column not found" });
        rl.close();
      }

      if (userAccountColumnIndex === -1) {
        parentPort.postMessage({ error: "Agent column not found" });
        rl.close();
      }

      if (categoryNameIndex === -1) {
        parentPort.postMessage({ error: "Agent column not found" });
        rl.close();
      }

      const userData = {
        firstName: row[userIndexMap.firstName] || "",
        dob: row[userIndexMap.dob] ? new Date(row[userIndexMap.dob]) : "",
        address: row[userIndexMap.address] || "",
        phone: row[userIndexMap.phone] || "",
        state: row[userIndexMap.state] || "",
        zipCode: row[userIndexMap.zipCode] || "",
        email: row[userIndexMap.email] || "",
        gender: row[userIndexMap.gender] || "",
        userType: row[userIndexMap.userType] || "",
      };

      // const policyInfoData = {
      //   policyNumber: row[policyInfoMap.policyNumber] || "",
      //   startDate: row[policyInfoMap.startDate]
      //     ? new Date(row[policyInfoMap.startDate])
      //     : "",
      //   endDate: row[policyInfoMap.endDate]
      //     ? new Date(row[policyInfoMap.endDate])
      //     : "",
      // };

      // console.log(userData);
    } else if (agentColumnIndex !== -1 && row[agentColumnIndex]) {
      agents.push({ agentName: row[agentColumnIndex] });
      userAccounts.push({ userAccountName: row[userAccountColumnIndex] });
      categoryNames.push({ categoryName: row[categoryNameIndex] });
      companyNames.push({ companyName: row[companyNameIndex] });
      //  console.log(companyNames, agents);
      // users.push(userData);

      users.push({
        //firstName: row[userIndexMap.firstName],
        firstName: row[userIndexMap.firstName]
          ?.toLowerCase()
          .replace(/\s/g, ""),
        dob: row[userIndexMap.dob],
        // dob: row[userIndexMap.dob]
        //   ? new Date(row[userIndexMap.dob])
        //   : new Date(row[userIndexMap.dob]),

        // dob: moment(row[userIndexMap.dob], ["YYYY-MM-DD", "MM/DD/YYYY"]).toDate(),
        //  row[userIndexMap.dob]
        //   ? moment(row[userIndexMap.dob], ["YYYY-MM-DD", "MM/DD/YYYY"]).toDate()
        //   : null,

        address: row[userIndexMap.address],
        phone: row[userIndexMap.phone],
        state: row[userIndexMap.state],
        zipCode: row[userIndexMap.zipCode],
        email: row[userIndexMap.email],
        // gender: row[userIndexMap.gender],
        userType: row[userIndexMap.userType],
      });

      console.log("inserting policyinfoarray ...");

      policyinfoarray.push({
        policyNumber: row[policyInfoIndexMap.policyNumber] || "",
        startDate: row[policyInfoIndexMap.startDate]
          ? new Date(row[policyInfoIndexMap.startDate])
          : "",
        endDate: row[policyInfoIndexMap.endDate]
          ? new Date(row[policyInfoIndexMap.endDate])
          : "",
          firstName: row[userIndexMap.firstName]
          ?.toLowerCase()
          .replace(/\s/g, ""),
        dob: row[userIndexMap.dob],
      });

      console.log("inserted policyinfoarray");
    }
  });

  rl.on("close", async () => {
    try {
      if (agents.length > 0) {
        // console.log("📥 Inserting Agents:", agents);
        console.log("📥 Inserting Agents:");
        await Agent.insertMany(agents);
        console.log("📥 Inserting userAccounts:");
        await UserAccount.insertMany(userAccounts);
        await PolicyCategory.insertMany(categoryNames);
        await PolicyCarrier.insertMany(companyNames);
        console.log("📥 Inserting users:");
        await User.insertMany(users)
          .then((docs) => {
            console.log("Inserted users:", docs);
          })
          .catch((error) => {
            console.error("Error inserting users:", error);
          });

        await PolicyInfo.insertMany(policyinfoarray);

        //  console.log(userAccounts)
        await console.log("✅ all inserted  in database successfully");
      } else {
        console.log("⚠️ No valid agent data found.");
      }

      parentPort.postMessage({
        message: "Processing complete",
        // insertedCount: agents.length,
        // insertedCount: userAccounts.length,
      });
    } catch (error) {
      console.error("❌ Database Insertion Error:", error);
      parentPort.postMessage({ error: "Database insertion failed" });
    } finally {
      mongoose.connection.close(); // Close connection after processing
    }
  });
};

// Start processing
processFile();

// import { parentPort, workerData } from "worker_threads";
// import fs from "fs";
// import readline from "readline";
// import mongoose from "mongoose";
// import Agent from "../models/Agent.js";
// import UserAccount from "../models/UserAccount.js";
// import connectDB from "../config/db.js"; // Import DB connection

// const extractFromCSV = (filePath, columnName) => {
//   return new Promise((resolve, reject) => {
//     const readStream = fs.createReadStream(filePath);
//     const rl = readline.createInterface({ input: readStream });

//     let headers = [];
//     let columnIndex = -1;
//     const extractedData = [];

//     rl.on("line", (line) => {
//       const row = line.split(",").map((cell) => cell.trim());

//       if (headers.length === 0) {
//         headers = row.map((header) => header.toLowerCase());
//         columnIndex = headers.indexOf(columnName.toLowerCase());

//         if (columnIndex === -1) {
//           reject(`${columnName} column not found`);
//           rl.close();
//         }
//       } else {
//         if (columnIndex !== -1 && row[columnIndex]) {
//           extractedData.push({ [columnName]: row[columnIndex] });
//         }
//       }
//     });

//     rl.on("close", () => resolve(extractedData));
//     rl.on("error", (err) => reject(err));
//   });
// };

// // const insertData = async (Model, data, label) => {
// //   try {
// //     if (data.length > 0) {
// //       console.log(`📥 Inserting ${label}:`, data);
// //       await Model.insertMany(data);
// //       console.log(`✅ ${label} inserted successfully`);
// //       return data.length;
// //     } else {
// //       console.log(`⚠️ No valid ${label} data found.`);
// //       return 0;
// //     }
// //   } catch (error) {
// //     console.error(`❌ Database Insertion Error (${label}):`, error);
// //     parentPort.postMessage({ error: `${label} insertion failed` });
// //     return 0;
// //   }
// // };

// const insertData = async (Model, data, label) => {
//   try {
//     const validData = data.filter((entry) => Object.values(entry)[0]); // Ensure non-empty values

//     if (validData.length > 0) {
//       console.log(`📥 Inserting ${label}:`, validData);
//       await Model.insertMany(validData);
//       console.log(`✅ ${label} inserted successfully`);
//       return validData.length;
//     } else {
//       console.log(`⚠️ No valid ${label} data found.`);
//       return 0;
//     }
//   } catch (error) {
//     console.error(`❌ Database Insertion Error (${label}):`, error);
//     parentPort.postMessage({ error: `${label} insertion failed` });
//     return 0;
//   }
// };

// const processFile = async () => {
//   try {
//     await connectDB(); // Connect to the database once

//     const agents = await extractFromCSV(workerData.filePath, "agent");
//     const userAccounts = await extractFromCSV(workerData.filePath, "account_name");

//     const insertedAgents = await insertData(Agent, agents, "Agents");
//     const insertedAccounts = await insertData(UserAccount, userAccounts, "User Accounts");

//     parentPort.postMessage({
//       message: "Processing complete",
//       insertedAgents,
//       insertedAccounts,
//     });

//   } catch (error) {
//     parentPort.postMessage({ error });
//   } finally {
//     mongoose.connection.close(); // Close the connection once all operations are done
//   }
// };

// // Start processing
// processFile();

// // const fs = require("fs");
// // const readline = require("readline");
// // const mongoose = require("mongoose");
// // const { parentPort, workerData } = require("worker_threads");

// // import { parentPort, workerData } from "worker_threads";
// // import fs from "fs";
// // import readline from "readline";
// // import mongoose from "mongoose";
// // import Agent from "../models/Agent.js";
// // import connectDB from "../config/db.js"; // Import DB connection

// // const extractAgentsFromCSV = (filePath) => {
// //   return new Promise((resolve, reject) => {
// //     const readStream = fs.createReadStream(filePath);
// //     const rl = readline.createInterface({ input: readStream });

// //     let headers = [];
// //     let agentColumnIndex = -1;
// //     const agents = [];

// //     rl.on("line", (line) => {
// //       const row = line.split(",").map((cell) => cell.trim());

// //       if (headers.length === 0) {
// //         headers = row.map((header) => header.toLowerCase());
// //         agentColumnIndex = headers.indexOf("agent");

// //         if (agentColumnIndex === -1) {
// //           reject("Agent column not found");
// //           rl.close();
// //         }
// //       } else {
// //         if (agentColumnIndex !== -1 && row[agentColumnIndex]) {
// //           agents.push({ agentName: row[agentColumnIndex] });
// //         }
// //       }
// //     });

// //     rl.on("close", () => resolve(agents));
// //     rl.on("error", (err) => reject(err));
// //   });
// // };

// // const processAgents = async (agents) => {
// //   try {
// //     await connectDB();

// //     if (agents.length > 0) {
// //       console.log("📥 Inserting Agents:", agents);
// //       await Agent.insertMany(agents);
// //       console.log("✅ Agents inserted successfully");
// //     } else {
// //       console.log("⚠️ No valid agent data found.");
// //     }

// //     parentPort.postMessage({
// //       message: "Processing complete",
// //       insertedCount: agents.length,
// //     });
// //   } catch (error) {
// //     console.error("❌ Database Insertion Error:", error);
// //     parentPort.postMessage({ error: "Database insertion failed" });
// //   } finally {
// //     mongoose.connection.close();
// //   }
// // };

// // const extractUserAccountFromCSV = (filePath) => {
// //   return new Promise((resolve, reject) => {
// //     const readStream = fs.createReadStream(filePath);
// //     const rl = readline.createInterface({ input: readStream });

// //     let headers = [];
// //     let accountColumnIndex = -1;
// //     const userAccounts = [];

// //     rl.on("line", (line) => {
// //       const row = line.split(",").map((cell) => cell.trim());

// //       if (headers.length === 0) {
// //         headers = row.map((header) => header.toLowerCase());
// //         accountColumnIndex = headers.indexOf("account_name");

// //         if (accountColumnIndex === -1) {
// //           reject("Account Name column not found");
// //           rl.close();
// //         }
// //       } else {
// //         if (accountColumnIndex !== -1 && row[accountColumnIndex]) {
// //           userAccounts.push({ accountName: row[accountColumnIndex] });
// //         }
// //       }
// //     });

// //     rl.on("close", () => resolve(userAccounts));
// //     rl.on("error", (err) => reject(err));
// //   });
// // };

// // const processUserAccounts = async (userAccounts) => {
// //   try {
// //     await connectDB();

// //     if (userAccounts.length > 0) {
// //       console.log("📥 Inserting User Accounts:", userAccounts);
// //       await UserAccount.insertMany(userAccounts);
// //       console.log("✅ User Accounts inserted successfully");
// //     } else {
// //       console.log("⚠️ No valid user account data found.");
// //     }

// //     parentPort.postMessage({
// //       message: "Processing complete",
// //       insertedCount: userAccounts.length,
// //     });
// //   } catch (error) {
// //     console.error("❌ Database Insertion Error:", error);
// //     parentPort.postMessage({ error: "Database insertion failed" });
// //   } finally {
// //     mongoose.connection.close();
// //   }
// // };

// // // Main function to process CSV
// // const processFile = async () => {
// //   try {
// //     const agents = await extractAgentsFromCSV(workerData.filePath);
// //     const userAccounts = await extractUserAccountFromCSV(workerData.filePath);
// //     await processAgents(agents);
// //     await processUserAccounts(userAccounts);

// //   } catch (error) {
// //     parentPort.postMessage({ error });
// //   }
// // };

// // // Start processing
// // processFile();
