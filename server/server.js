const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");
const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const UserModel = require("./models/user");
const app = express();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8081",
  "http://192.168.100.110:3000",
  "http://192.168.100.110:8081",
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("fetchMatchData", async ({ userEmail, areaName, sessionDate }) => {
    try {
      const decodedDate = decodeURIComponent(sessionDate);

      const user = await UserModel.findOne(
        {
          email: userEmail,
          "areas.name": areaName,
          "areas.sessions.sessionDate": decodedDate,
        },
        {
          "areas.$": 1,
        }
      );

      if (!user || !user.areas?.length) {
        return socket.emit("error", { message: "Area not found" });
      }

      const area = user.areas[0];
      const session = area.sessions.find((s) => s.sessionDate === decodedDate);

      if (!session) {
        return socket.emit("error", { message: "Match session not found" });
      }

      socket.emit("matchDataFetched", {
        matches: session.matches,
        inMatch: session.inMatch,
      });
    } catch (err) {
      console.error("Error in fetchMatchData:", err);
      socket.emit("error", {
        message: "Server error while fetching match data",
      });
    }
  });

  // Socket.IO event for fetching courts
  socket.on("fetchCourts", async ({ userEmail, areaName }) => {
    try {
      const user = await UserModel.findOne(
        {
          email: userEmail,
          "areas.name": areaName,
        },
        {
          "areas.$": 1, // This projects only the matched area
        }
      );

      if (!user || !user.areas?.length) {
        return socket.emit("error", { message: "Area not found" });
      }

      const area = user.areas[0];

      socket.emit("courtsFetched", area.courts || []);
    } catch (error) {
      console.error("Error fetching courts:", error);
      socket.emit("error", { message: "Failed to fetch courts" });
    }
  });

  socket.on("fetchPlayers", async ({ userEmail, areaName, sessionDate }) => {
    try {
      const decodedDate = decodeURIComponent(sessionDate);

      const user = await UserModel.findOne(
        {
          email: userEmail,
          "areas.name": areaName,
          "areas.sessions.sessionDate": decodedDate,
        },
        {
          "areas.$": 1,
        }
      );

      if (!user || !user.areas?.length) {
        return socket.emit("error", {
          message: "Area not found",
          details: { userEmail, areaName, sessionDate },
        });
      }

      const area = user.areas[0];
      const session = area.sessions.find((s) => s.sessionDate === decodedDate);

      if (!session) {
        return socket.emit("error", {
          message: "Player session not found",
          details: { userEmail, areaName, sessionDate },
        });
      }

      const players = session.players || [];
      const playerHistory = session.playerHistory || [];

      socket.emit("playerDataFetched", {
        playerss: players,
        playerHisto: playerHistory,
      });
    } catch (err) {
      console.error("Error in playerDataFetched:", err);
      socket.emit("error", {
        message: "Server error while fetching player data",
        details: { error: err.message },
      });
    }
  });

  const normalizeDate = (str) => decodeURIComponent(str).trim();

  const getSessionFromUser = (user, areaName, sessionDate) => {
    const area = user.areas.find((a) => a.name === areaName);
    if (!area) return { area: null, session: null };

    const session = area.sessions.find(
      (s) => normalizeDate(s.sessionDate) === normalizeDate(sessionDate)
    );
    return { area, session };
  };

  socket.on("fetchData", async ({ userEmail, areaName, sessionDate }) => {
    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return socket.emit("error", { message: "User not found" });

      const { area, session } = getSessionFromUser(user, areaName, sessionDate);
      if (!area) return socket.emit("error", { message: "Area not found" });
      if (!session)
        return socket.emit("error", { message: "Session not found" });

      const emitData = (userObj, areaObj, sessionObj) => {
        socket.emit("dataFetched", {
          schedules: userObj.schedules,
          players: sessionObj.players,
          playerHistory: sessionObj.playerHistory,
          matches: sessionObj.matches,
          inMatch: sessionObj.inMatch,
          courts: areaObj.courts,
        });
      };

      emitData(user, area, session);
      socket.updateInterval = setInterval(async () => {
        const updatedUser = await UserModel.findOne({ email: userEmail });
        if (!updatedUser) return;

        const { area: updatedArea, session: updatedSession } =
          getSessionFromUser(updatedUser, areaName, sessionDate);

        if (updatedArea && updatedSession) {
          socket.emit("updateData", {
            schedules: updatedUser.schedules,
            players: updatedSession.players,
            playerHistory: updatedSession.playerHistory,
            matches: updatedSession.matches,
            inMatch: updatedSession.inMatch,
            courts: updatedArea.courts,
          });
        }
      }, 2000);
    } catch (error) {
      console.error("Error in fetchData:", error);
      socket.emit("error", { message: "Failed to fetch session data" });
    }
  });

  socket.on("getReqToJoin", async ({ userEmail, areaName, sessionDate }) => {
    try {
      const decodedDate = decodeURIComponent(sessionDate);
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return socket.emit("reqToJoinError", { message: "User not found" });
      }

      const area = user.areas.find((a) => a.name === areaName);
      if (!area) {
        return socket.emit("reqToJoinError", { message: "Area not found" });
      }

      const session = area.sessions.find((s) => s.sessionDate === decodedDate);
      if (!session) {
        return socket.emit("reqToJoinError", { message: "Session not found" });
      }

      socket.emit("reqToJoinData", { playerReqList: session.reqToJoin });
    } catch (error) {
      console.error("Error fetching reqToJoin:", error);
      socket.emit("reqToJoinError", { message: "Failed to fetch players" });
    }
  });

  socket.on(
    "deletePlayers",
    async ({ userEmail, areaName, sessionDate, playerIds }) => {
      try {
        const decodedDate = decodeURIComponent(sessionDate);
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
          return socket.emit("reqToJoinError", { message: "User not found" });
        }

        const area = user.areas.find((a) => a.name === areaName);
        if (!area) {
          return socket.emit("reqToJoinError", { message: "Area not found" });
        }

        const session = area.sessions.find(
          (s) => s.sessionDate === decodedDate
        );
        if (!session) {
          return socket.emit("reqToJoinError", {
            message: "Session not found",
          });
        }

        session.reqToJoin = session.reqToJoin.filter(
          (player) => !playerIds.includes(player._id.toString())
        );

        await user.save();

        console.log(" Updated reqToJoin list:", session.reqToJoin);
        io.emit("reqToJoinUpdate", {
          textCode: session.textCode,
          playerReqList: session.reqToJoin,
          players: session.players,
        });
      } catch (error) {
        console.error("❌ Error deleting players:", error);
        socket.emit("reqToJoinError", { message: "Failed to delete players" });
      }
    }
  );

  socket.on("fetchSessionData", async ({ sessionCode }) => {
    try {
      const user = await UserModel.findOne(
        { "areas.sessions.textCode": sessionCode },
        { areas: 1 }
      );

      if (!user)
        return socket.emit("joinRequestError", { message: "Invalid QR Code" });

      let foundSession = null;
      let foundAreaName = null;
      let foundCourtFeeType = null;
      let foundCourtFee = null;
      let foundBallFee = null;

      for (const area of user.areas) {
        foundSession = area.sessions.find(
          (session) => session.textCode === sessionCode
        );
        if (foundSession) {
          foundAreaName = area.name;
          foundCourtFeeType = area.courtFeeType;
          foundCourtFee = area.courtFee;
          foundBallFee = area.ballFee;
          break;
        }
      }

      if (!foundSession)
        return socket.emit("joinRequestError", {
          message: "Session Expired or Not Found",
        });

      const emitSessionData = (session, area) => {
        const sessionPlayers = session.players || [];
        const sessionPlayerHistory = session.playerHistory || [];
        const reqToJoin = session.reqToJoin || [];
        const inMatch = session.inMatch || [];
        const matchedPlayers = reqToJoin.filter((reqPlayer) =>
          sessionPlayers.some(
            (player) => player._id?.toString?.() === reqPlayer._id?.toString?.()
          )
        );

        io.emit("sessionDataFetched", {
          textCode: session.textCode,
          qrCode: session.qrCode,
          areaName: area.name,
          courtFeeType: area.courtFeeType,
          courtFee: area.courtFee,
          ballFee: area.ballFee,
          players: sessionPlayers,
          playerHistory: sessionPlayerHistory,
          playerReqList: reqToJoin,
          matchedPlayers,
          inMatch: inMatch,
        });

        io.emit("reqToJoinUpdate", {
          playerReqList: reqToJoin,
          players: sessionPlayers,
          playerHistory: sessionPlayerHistory,
        });
      };

      emitSessionData(foundSession, {
        name: foundAreaName,
        courtFeeType: foundCourtFeeType,
        courtFee: foundCourtFee,
        ballFee: foundBallFee,
      });

      // Clear any existing interval
      if (socket.updateInterval) clearInterval(socket.updateInterval);

      // Set a new interval for live updates
      socket.updateInterval = setInterval(async () => {
        const updatedUser = await UserModel.findOne(
          { "areas.sessions.textCode": sessionCode },
          { areas: 1 }
        );

        if (!updatedUser) return;

        for (const area of updatedUser.areas) {
          const updatedSession = area.sessions.find(
            (session) => session.textCode === sessionCode
          );

          if (updatedSession) {
            emitSessionData(updatedSession, area);
            break;
          }
        }
      }, 2000);
    } catch (error) {
      console.error("Error fetching session:", error);
      socket.emit("joinRequestError", { message: "Failed to fetch session" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    clearInterval(socket.updateInterval);
  });
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://j0rdanarrivado:WfNDgnY6dV0mluWg@cluster0.hutg4cj.mongodb.net/",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.post("/", async function (req, res, next) {
  try {
    const redirectUrl = "http://localhost:3000/App";
    const oAuthClient = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  }
});

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

app.post("/google-login", async (req, res) => {
  const { tokenId } = req.body;

  const client = new OAuth2Client(
    CLIENT_ID,
    CLIENT_SECRET,
    "http://localhost:3000/App"
  );

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = new UserModel({
        email,
        fullName: name,
        profileImage: picture,
      });
      await user.save();
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    if (error.code === "ETIMEDOUT") {
      res.status(503).json({
        message: "Service temporarily unavailable. Please try again later.",
      });
    } else {
      res.status(500).json({
        message: "Google login failed. Please try again.",
      });
    }
  }
});

app.post("/create-payment", async (req, res) => {
  const { amount, name, email } = req.body;

  try {
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: {
              name,
              email,
            },
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: "Payment for badminton session",
            line_items: [
              {
                amount: amount * 100,
                currency: "PHP",
                name: "Badminton Session",
                quantity: 1,
              },
            ],
            payment_method_types: ["gcash", "card", "grab_pay"],
            success_url: "https://yourdomain.com/payment-success",
            cancel_url: "https://yourdomain.com/payment-cancelled",
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_KEY
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ checkoutUrl: response.data.data.attributes.checkout_url });
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "2d",
  });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post("/api/verify-token", (req, res) => {
  const { token } = req.body;

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  });
});

app.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required." });
  }

  try {
    jwt.verify(refreshToken, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Invalid or expired refresh token." });
      }
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res
          .status(403)
          .json({ message: "User not found or invalid refresh token." });
      }

      const newAccessToken = generateAccessToken(user);

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// User Registration
app.post("/register", async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new UserModel({ fullName, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Regular User Login Route (email/password)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens to client
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error." });
  }
});

//////////////////////Add Scheduleeeeeeeeee
app.put("/users/:userEmail/schedules", async (req, res) => {
  const { userEmail } = req.params;
  const { title, date, startTime, description, location } = req.body;

  try {
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Ensure the date is in the desired format
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const newSchedule = {
      title,
      date: formattedDate, // Store the formatted date
      startTime,
      description,
      location,
    };

    user.schedules.push(newSchedule);
    await user.save();

    res.status(201).send({
      ...newSchedule,
    });
  } catch (error) {
    console.error("Error adding schedule:", error);
    res.status(500).send({ error: "Failed to add schedule" });
  }
});

////////get Schedule
app.get("/users/:userEmail/schedules", async (req, res) => {
  const { userEmail } = req.params;

  try {
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user.schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).send({ error: "Failed to fetch schedules" });
  }
});

// Edit Schedule
app.post("/users/:userEmail/schedules/:scheduleId", async (req, res) => {
  const { userEmail, scheduleId } = req.params;
  const { title, description, date, startTime, location } = req.body;

  try {
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const schedule = user.schedules.id(scheduleId);
    if (!schedule) {
      return res.status(404).send({ error: "Schedule not found" });
    }

    // Update schedule fields
    schedule.title = title || schedule.title;
    schedule.description = description || schedule.description;
    schedule.date = date ? new Date(date) : schedule.date;
    schedule.startTime = startTime || schedule.startTime;
    schedule.location = location || schedule.location;

    await user.save();

    res.status(200).send(schedule);
  } catch (error) {
    console.error("Error editing schedule:", error);
    res.status(500).send({ error: "Failed to edit schedule" });
  }
});

//Delete Schedule
app.delete("/users/:userEmail/schedules/:scheduleId", async (req, res) => {
  const { userEmail, scheduleId } = req.params;

  try {
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const schedule = user.schedules.id(scheduleId);
    if (!schedule) {
      return res.status(404).send({ error: "Schedule not found" });
    }

    user.schedules.pull(scheduleId);
    await user.save();

    res.status(200).send({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).send({ error: "Failed to delete schedule" });
  }
});

app.put("/users/:userEmail/areas", async (req, res) => {
  const { userEmail } = req.params;
  const { name, courtFeeTypeDis } = req.body;

  console.log("Received request:", req.body);

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.error("User not found:", userEmail);
      return res.status(404).send({ error: "User not found" });
    }

    if (!courtFeeTypeDis) {
      console.error("Missing courtFeeType in request");
      return res.status(400).send({ error: "courtFeeType is required" });
    }

    const newArea = {
      name,
      sessions: [],
      courts: [
        { name: "Court 1", addMatches: [] },
        { name: "Court 2", addMatches: [] },
        { name: "Court 3", addMatches: [] },
      ],
      courtFeeType: courtFeeTypeDis,
      courtFee: 90,
      ballFee: 20,
    };

    console.log("Adding new area:", newArea);

    user.areas.push(newArea);
    await user.save();

    console.log("Area added successfully");
    res.status(201).send(user.areas[user.areas.length - 1]);
  } catch (error) {
    console.error("Error adding area:", error);
    res
      .status(500)
      .send({ error: "Failed to add area", details: error.message });
  }
});

app.get("/users/:userId/areas", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findOne({ email: userId });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user.areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).send({ error: "Failed to fetch areas" });
  }
});

app.get("/users/:email/areas/:areaName", async (req, res) => {
  try {
    const { email, areaName } = req.params;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const area = user.areas.find(
      (a) => a.name === decodeURIComponent(areaName)
    );

    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.json({ courtFee: area.courtFee, ballFee: area.ballFee });
  } catch (error) {
    console.error("Error fetching area fees:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Get the courtFeeType
app.get("/users/:email/areas/:areaName/courtFeeType", async (req, res) => {
  try {
    console.log("Received GET request:", req.params.email, req.params.areaName);

    const { email, areaName } = req.params;

    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const area = user.areas.find(
      (area) => area.name === decodeURIComponent(areaName)
    );
    if (!area) {
      console.log("Area not found:", areaName);
      return res.status(400).json({ message: "No Session at the moment" });
    }

    console.log("Court Fee Type:", area.courtFeeType);
    res.json({ courtFeeType: area.courtFeeType });
  } catch (error) {
    console.error("Failed to retrieve the Court Fee Type", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/users/:email/areas/:areaName/editCourtFeeType", async (req, res) => {
  try {
    console.log("Received PUT request:", req.params.email, req.params.areaName);
    console.log("Request Body:", req.body);

    const { email, areaName } = req.params;
    const { courtFeeType } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not Found" });
    }

    const area = user.areas.find(
      (area) => area.name === decodeURIComponent(areaName)
    );
    if (!area) {
      console.log("Area not found:", areaName);
      return res.status(404).json({ message: "Area not found" });
    }

    if (!courtFeeType) {
      console.log("No courtFeeType provided");
      return res.status(400).json({ message: "No courtFeeType" });
    }

    console.log("Updating courtFeeType:", courtFeeType);
    area.courtFeeType = courtFeeType;
    await user.save();
    console.log("Updated successfully!");

    res.json({ message: "Court Fee Type updated successfully" });
  } catch (error) {
    console.error("Failed to Edit the CourtFeeType", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/users/:email/areas/:areaName/updatePrices", async (req, res) => {
  try {
    const { email, areaName } = req.params;
    const { courtFee, ballFee } = req.body;

    // Validate input
    if (isNaN(courtFee) || isNaN(ballFee) || courtFee < 0 || ballFee < 0) {
      return res.status(400).json({ message: "Invalid court or ball fee." });
    }

    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the specific area
    const area = user.areas.find(
      (area) => area.name === decodeURIComponent(areaName)
    );
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    // Update fees
    area.courtFee = parseFloat(courtFee);
    area.ballFee = parseFloat(ballFee);

    // Save changes
    await user.save();

    res.status(200).json({ message: "Prices updated successfully" });
  } catch (error) {
    console.error("Error updating prices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get Area's court
app.get("/users/:userEmail/areas/:areaName/courts", async (req, res) => {
  const { userEmail, areaName } = req.params;

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const area = user.areas.find((a) => a.name === areaName);
    if (!area) {
      return res.status(404).send({ error: "Area not found" });
    }

    res.status(200).send(area.courts);
  } catch (error) {
    console.error("Error fetching courts:", error);
    res.status(500).send({ error: "Failed to fetch courts" });
  }
});

// Edit Add one court
app.put("/users/:email/areas/:areaName/courts", async (req, res) => {
  try {
    const { email, areaName } = req.params;
    const { name } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const area = user.areas.find((a) => a.name === areaName);
    if (!area) return res.status(404).json({ message: "Area not found" });

    const newCourt = {
      _id: new mongoose.Types.ObjectId(),
      name,
      addMatches: [],
    };
    area.courts.push(newCourt);

    await user.save();
    res.json(newCourt);
  } catch (error) {
    console.error("Error adding court:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Delete
app.delete(
  "/users/:email/areas/:areaName/courts/:courtId",
  async (req, res) => {
    try {
      const { email, areaName, courtId } = req.params;

      const user = await UserModel.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const area = user.areas.find((a) => a.name === areaName);
      if (!area) return res.status(404).json({ message: "Area not found" });

      if (!area.courts || area.courts.length === 0) {
        return res
          .status(404)
          .json({ message: "No courts found in this area" });
      }

      const courtIndex = area.courts.findIndex(
        (court) => court._id.toString() === courtId
      );
      if (courtIndex === -1) {
        return res.status(404).json({ message: "Court not found" });
      }

      area.courts.splice(courtIndex, 1);
      await user.save();

      res.json({ message: "Court deleted successfully" });
    } catch (error) {
      console.error("Error deleting court:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete All court
app.delete("/users/:email/areas/:areaName/courts", async (req, res) => {
  try {
    const { email, areaName } = req.params;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const area = user.areas.find((a) => a.name === areaName);
    if (!area) return res.status(404).json({ message: "Area not found" });

    area.courts = []; // Remove all courts
    await user.save();

    res.json({ message: "All courts deleted successfully" });
  } catch (error) {
    console.error("Error deleting all courts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add match to a court
app.put(
  "/users/:userEmail/areas/:areaName/courts/:courtId/addMatches",
  async (req, res) => {
    const { userEmail, areaName, courtId } = req.params;
    const { matchId } = req.body;

    try {
      // Find the user by email
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }

      // Find the area within the user's areas
      const area = user.areas.find((area) => area.name === areaName);
      if (!area) {
        console.log("Area not found");
        return res.status(404).json({ message: "Area not found" });
      }

      // Find the court inside the area
      const court = area.courts.find(
        (court) => court._id.toString() === courtId
      );
      if (!court) {
        console.log("Court not found");
        return res.status(404).json({ message: "Court not found" });
      }

      // Check if the match already exists
      if (court.addMatches.some((match) => match.toString() === matchId)) {
        return res
          .status(400)
          .json({ message: "Match already exists in this court" });
      }

      // Add the match to the court
      court.addMatches.push(matchId);
      await user.save();

      res.status(200).json(court);
    } catch (error) {
      console.error("Error adding match to court:", error);
      res.status(500).json({ message: "Failed to add match to court" });
    }
  }
);

// Delete all matches in a court
app.delete(
  "/users/:userEmail/areas/:areaName/courts/:courtId/addMatches",
  async (req, res) => {
    const { userEmail, areaName, courtId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ message: "User not found" });

      const area = user.areas.find((a) => a.name === areaName);
      if (!area) return res.status(404).json({ message: "Area not found" });

      const court = area.courts.find((c) => c._id.toString() === courtId);
      if (!court) return res.status(404).json({ message: "Court not found" });

      court.addMatches = [];

      await user.save();

      return res
        .status(200)
        .json({ message: "All matches removed from court", court });
    } catch (error) {
      console.error("Error clearing matches from court:", error);
      return res
        .status(500)
        .json({ message: "Failed to clear matches from court" });
    }
  }
);

// Edit Areaaaaa  ///////////////////////////////////////////////////////
app.put("/users/:userEmail/areas/:index", async (req, res) => {
  const { userEmail, index } = req.params;
  const { name } = req.body;

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (index < 0 || index >= user.areas.length) {
      return res.status(400).send({ error: "Invalid area index" });
    }

    user.areas[index].name = name;

    await user.save();

    res.status(200).send(user.areas[index]);
  } catch (error) {
    console.error("Error updating area:", error);
    res.status(500).send({ error: "Failed to update area" });
  }
});

//Delete Areaaaa////////////////////////////////////////////////////////////
app.delete("/users/:userEmail/areas/:index", async (req, res) => {
  const { userEmail, index } = req.params;

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (index < 0 || index >= user.areas.length) {
      return res.status(400).send({ error: "Invalid area index" });
    }

    user.areas.splice(index, 1);

    await user.save();

    res.status(200).send({ message: "Area deleted successfully" });
  } catch (error) {
    console.error("Error deleting area:", error);
    res.status(500).send({ error: "Failed to delete area" });
  }
});

const QRCode = require("qrcode");
const { nanoid } = require("nanoid");

app.put("/users/:userEmail/areas/:areaName/session/", async (req, res) => {
  const { userEmail, areaName } = req.params;
  const { mode, sessionCurrentDate } = req.body;

  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) return res.status(404).send({ error: "User not found" });

    const area = user.areas.find((area) => area.name === areaName);
    if (!area) return res.status(404).send({ error: "Area not found" });

    // Ensure unique textCode
    let textCode;
    let isUnique = false;
    while (!isUnique) {
      textCode = nanoid(8);
      isUnique = !user.areas.some((area) =>
        area.sessions.some((session) => session.textCode === textCode)
      );
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(textCode);

    // Create new session
    const newSession = {
      sessionDate: sessionCurrentDate,
      mode,
      textCode,
      qrCode,
      createdAt: new Date().toISOString(),
    };

    area.sessions.push(newSession);
    await user.save();

    res
      .status(201)
      .send({ message: "Session created successfully", session: newSession });
  } catch (error) {
    console.error("Error adding session:", error);
    res.status(500).send({ error: "Failed to add session" });
  }
});

app.get("/sessions/:textCode", async (req, res) => {
  const { textCode } = req.params;

  try {
    const user = await UserModel.findOne(
      { "areas.sessions.textCode": textCode },
      { areas: 1 }
    );

    if (!user) return res.status(404).send({ error: "Invalid QR Code" });

    let foundSession = null;

    for (const area of user.areas) {
      foundSession = area.sessions.find(
        (session) => session.textCode === textCode
      );
      if (foundSession) break;
    }

    if (!foundSession)
      return res.status(404).send({ error: "Session Expired or Not Found" });

    const sessionPlayers = foundSession.players || [];
    const reqToJoin = foundSession.reqToJoin || [];

    const matchedPlayers = reqToJoin.filter((reqPlayer) =>
      sessionPlayers.some(
        (player) => player._id?.toString?.() === reqPlayer._id?.toString?.()
      )
    );

    res.status(200).send({
      textCode: foundSession.textCode,
      qrCode: foundSession.qrCode,
      players: sessionPlayers,
      playerReq: reqToJoin,
      matchedPlayers,
    });
  } catch (error) {
    console.error(" Error fetching session:", error);
    res.status(500).send({ error: "Failed to fetch session" });
  }
});

app.put("/sessions/reqToJoin", async (req, res) => {
  const { textCode, name, gender, level, currentTime } = req.body;

  if (!textCode || !name || !gender || !level) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await UserModel.findOne({
      "areas.sessions.textCode": textCode,
    });

    if (!user) {
      return res.status(404).json({ error: "Session not found" });
    }

    let sessionFound = null;

    for (const area of user.areas) {
      for (const session of area.sessions) {
        if (session.textCode === textCode) {
          const isDuplicate = session.reqToJoin.some(
            (player) => player.name.toLowerCase() === name.toLowerCase()
          );

          if (isDuplicate) {
            return res
              .status(400)
              .json({ error: "Name is already used in this session." });
          }

          const newPlayer = { name, gender, level, timeQueue: currentTime };
          session.reqToJoin.push(newPlayer);
          sessionFound = session;
          break;
        }
      }
    }

    if (!sessionFound) {
      return res
        .status(404)
        .json({ error: "Session not found in user's areas" });
    }

    await user.markModified("areas");
    await user.save();

    io.emit("reqToJoinUpdate", {
      textCode,
      playerReqList: sessionFound.reqToJoin,
    });

    return res.status(200).json({
      message: "Successfully joined session!",
      playerReqList: sessionFound.reqToJoin,
    });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ error: "Failed to join session" });
  }
});

/*
app.get("/sessions/:textCode/:playerName", async (req, res) => {
  const { textCode, playerName } = req.params;

  try {
    const user = await UserModel.findOne(
      { "areas.sessions.textCode": textCode },
      { areas: 1 }
    );

    if (!user) return res.status(404).send({ error: "Invalid QR Code" });

    let foundSession = null;

    for (const area of user.areas) {
      foundSession = area.sessions.find(
        (session) => session.textCode === textCode
      );
      if (foundSession) break;
    }

    if (!foundSession)
      return res.status(404).send({ error: "Session Expired or Not Found" });

    const sessionPlayers = foundSession.players || [];
    const reqToJoin = foundSession.reqToJoin || [];

    const matchedPlayers = reqToJoin.filter((reqPlayer) =>
      sessionPlayers.some(
        (player) => player._id?.toString?.() === reqPlayer._id?.toString?.()
      )
    );

    res.status(200).send({
      textCode: foundSession.textCode,
      qrCode: foundSession.qrCode,
      players: sessionPlayers,
      matchedPlayers,
    });
  } catch (error) {
    console.error("❌ Error fetching session:", error);
    res.status(500).send({ error: "Failed to fetch session" });
  }
});
*/
app.get("/users/:email/areas/:areaName/sessions", async (req, res) => {
  const { email, areaName } = req.params;
  try {
    const user = await UserModel.findOne({ email });
    const area = user.areas.find((area) => area.name === areaName);
    if (area) {
      return res.json(area.sessions);
    }
    return res.status(404).send("Area not found");
  } catch (error) {
    console.error("Error fetching area sessions:", error);
    return res.status(500).send("Server error");
  }
});

//SessionDate
app.get(
  "/users/:email/areas/:areaName/sessions/:sessionDate",
  async (req, res) => {
    const { email, areaName, sessionDate } = req.params;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(404).send({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).send({ error: "Area not found" });

      // Find the session by date
      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).send({ error: "Session not found" });

      // Generate a QR Code dynamically if not already stored
      if (!session.qrCode) {
        const qrCodeData = `Session: ${session.sessionDate}, Mode: ${session.mode}`;
        session.qrCode = await QRCode.toDataURL(qrCodeData);
        await user.save(); // Save the updated session with QR code
      }

      return res.json({
        textCode: session.textCode || "No text code available",
        qrCode: session.qrCode,
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      return res.status(500).send({ error: "Server error" });
    }
  }
);

/*
app.get(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/reqTojoin",
  async (req, res) => {
    const { userEmail, areaName } = req.params;
    const sessionDate = decodeURIComponent(req.params.sessionDate);
    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      res.status(200).json(session.reqToJoin);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  }
);
*/
////////////////////////////////////////////////////////////////////////////////////////////////////

// Utility Function
const updateSessionRevenue = async (userEmail, areaName, sessionDate) => {
  try {
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) throw new Error("User not found");

    const area = user.areas.find((area) => area.name === areaName);
    if (!area) throw new Error("Area not found");

    const session = area.sessions.find(
      (session) => session.sessionDate === sessionDate
    );
    if (!session) throw new Error("Session not found");

    const totalRevenue = session.playerHistory.reduce((total, player) => {
      return (
        total + player.transactions.reduce((sum, txn) => sum + txn.totalPaid, 0)
      );
    }, 0);

    session.sessionRevenue = totalRevenue;
    await user.save();

    console.log(
      `Updated revenue for session: ${sessionDate}, total: ${totalRevenue}`
    );
    return totalRevenue;
  } catch (error) {
    console.error("Error updating session revenue:", error);
    throw error;
  }
};

// Route Handler
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/revenue",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;
    const decodedSessionDate = decodeURIComponent(sessionDate);

    try {
      const revenue = await updateSessionRevenue(
        userEmail,
        areaName,
        decodedSessionDate
      );
      res
        .status(200)
        .json({ message: "Session revenue updated successfully", revenue });
    } catch (error) {
      res.status(error.message.includes("not found") ? 404 : 500).json({
        error: "Failed to update session revenue",
        details: error.message,
      });
    }
  }
);

////////////////////////////////////////////////////////////////////////////////////////////

// Add players for Session

app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/addPlayer",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;
    let { name, gender, level, currentTime, playerId } = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === decodeURIComponent(sessionDate)
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      if (
        session.players.some(
          (player) => player.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return res
          .status(400)
          .json({ error: "Player with this name already exists!" });
      }

      if (!playerId) playerId = new mongoose.Types.ObjectId();

      const newPlayer = {
        _id: playerId,
        name,
        gender,
        level,
        timeQueue: currentTime,
      };

      const newPlayerHistory = { _id: playerId, name, gender, level };

      session.players.push(newPlayer);
      session.playerHistory.push(newPlayerHistory);

      await user.save();

      res.status(200).json(newPlayer);
    } catch (error) {
      console.error("Error adding player:", error);
      res.status(500).json({ error: "Failed to add player" });
    }
  }
);

//timeQueue

//Add Ten Playerssssss
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/bulkAddPlayers",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;
    const { players, currentTime } = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === decodeURIComponent(sessionDate)
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      const newPlayers = [];
      const newPlayerHistory = [];

      players.forEach((player) => {
        // Create a single ObjectId for each player
        const playerId = new mongoose.Types.ObjectId();

        // Add the player to the newPlayers array
        newPlayers.push({
          _id: playerId,
          ...player,
          timeQueue: currentTime,
        });

        // Add the same player to the newPlayerHistory array
        newPlayerHistory.push({
          _id: playerId,
          ...player,
        });
      });

      session.players.push(...newPlayers);
      session.playerHistory.push(...newPlayerHistory);

      await user.save();

      res.status(200).json(newPlayers);
    } catch (error) {
      console.error("Error adding players:", error);
      res.status(500).json({ error: "Failed to add players" });
    }
  }
);

app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/:playerId/timeQueue",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const decodedSessionDate = decodeURIComponent(sessionDate);
      const session = area.sessions.find(
        (session) => session.sessionDate === decodedSessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      const player = session.players.id(playerId);
      if (!player)
        return res.status(404).json({ error: "Player not found in session" });

      const currentTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Manila",
      }).format(new Date());

      player.timeQueue = currentTime;

      await user.save();

      res.status(200).json({ success: true, updatedPlayer: player });
    } catch (error) {
      console.error("Error updating player timeQueue:", error);
      res.status(500).json({ error: "Failed to update player timeQueue" });
    }
  }
);

//teamBall

// Edit players
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/:playerId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;
    const updatedPlayerData = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      const player = session.players.id(playerId);

      if (!player) return res.status(404).json({ error: "Player not found" });

      Object.assign(player, updatedPlayerData);
      await user.save();

      res.status(200).json(player);
    } catch (error) {
      console.error("Error editing player:", error);
      res.status(500).json({ error: "Failed to edit player" });
    }
  }
);

/////////////////////////////////////////// teamBall

//Deleteeeee with Id
app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/:playerId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.players = session.players.filter(
        (player) => player._id.toString() !== playerId
      );

      await user.save();

      res.status(200).json({ message: "Player deleted successfully" });
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ error: "Failed to delete player" });
    }
  }
);

// Delete playerHistory with ID
app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/history/:playerId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.playerHistory = session.playerHistory.filter(
        (player) => player._id.toString() !== playerId
      );

      await user.save();

      res.status(200).json({ message: "Player deleted successfully" });
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ error: "Failed to delete player" });
    }
  }
);

// totalPaid

//Edit playerHistory
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/history/:playerId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;
    const updatedPlayerData = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      const player = session.playerHistory.id(playerId);

      if (!player) return res.status(404).json({ error: "Player not found" });

      Object.assign(player, updatedPlayerData);
      await user.save();

      res.status(200).json(player);
    } catch (error) {
      console.error("Error editing player:", error);
      res.status(500).json({ error: "Failed to edit player" });
    }
  }
);

const generateTransactionNo = (userEmail) => {
  const timestamp = Date.now().toString();
  const data = userEmail + timestamp;
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
};

app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/:playerId/totalPaid",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;
    const { totalPaid } = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      console.log("Received sessionDate:", decodeURIComponent(sessionDate));
      const session = area.sessions.find(
        (s) => s.sessionDate === decodeURIComponent(sessionDate)
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      // Find player
      const player = session.players.find((p) => p._id.toString() === playerId);
      if (!player) return res.status(404).json({ error: "Player not found" });

      // Find player history
      const playerHistory = session.playerHistory.find(
        (p) => p._id.toString() === playerId
      );
      if (!playerHistory)
        return res.status(404).json({ error: "Player history not found" });

      if (!playerHistory.transactions) {
        playerHistory.transactions = [];
      }

      const transactionNo = generateTransactionNo(userEmail);
      const existingTransaction = playerHistory.transactions.find(
        (transaction) => transaction.transactionNo === transactionNo
      );
      if (existingTransaction) {
        return res.status(400).json({ error: "Duplicate transaction number" });
      }

      const totalPaidValue = parseFloat(totalPaid);
      if (isNaN(totalPaidValue) || totalPaidValue <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }

      playerHistory.transactions.push({
        transactionNo,
        totalPaid: totalPaidValue,
      });
      playerHistory.totalPaid += totalPaidValue;

      // Remove player from session
      session.players = session.players.filter(
        (p) => p._id.toString() !== playerId
      );

      await user.save();

      const revenue = await updateSessionRevenue(
        userEmail,
        areaName,
        sessionDate
      );

      res.status(200).json({
        message: `Payment successful: ${totalPaidValue}`,
        totalPaid: playerHistory.totalPaid,
        sessionRevenue: revenue,
      });
    } catch (error) {
      console.error("Error during totalPaid update and player removal:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/bulkPayment",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;
    const { payments } = req.body; // Array of { playerId, totalPaid }

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      console.log("Received sessionDate:", decodeURIComponent(sessionDate));
      const session = area.sessions.find(
        (s) => s.sessionDate === decodeURIComponent(sessionDate)
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      let totalPaidAmount = 0;
      let failedPayments = [];

      for (const { playerId, totalPaid } of payments) {
        const player = session.players.find(
          (p) => p._id.toString() === playerId
        );
        if (!player) {
          failedPayments.push({ playerId, error: "Player not found" });
          continue;
        }

        const playerHistory = session.playerHistory.find(
          (p) => p._id.toString() === playerId
        );
        if (!playerHistory) {
          failedPayments.push({ playerId, error: "Player history not found" });
          continue;
        }

        if (!playerHistory.transactions) {
          playerHistory.transactions = [];
        }

        const transactionNo = generateTransactionNo(userEmail);
        const existingTransaction = playerHistory.transactions.find(
          (transaction) => transaction.transactionNo === transactionNo
        );
        if (existingTransaction) {
          failedPayments.push({
            playerId,
            error: "Duplicate transaction number",
          });
          continue;
        }

        const totalPaidValue = parseFloat(totalPaid);
        if (isNaN(totalPaidValue) || totalPaidValue <= 0) {
          failedPayments.push({ playerId, error: "Invalid payment amount" });
          continue;
        }

        playerHistory.transactions.push({
          transactionNo,
          totalPaid: totalPaidValue,
        });
        playerHistory.totalPaid += totalPaidValue;
        totalPaidAmount += totalPaidValue;

        // Remove player from session
        session.players = session.players.filter(
          (p) => p._id.toString() !== playerId
        );
      }

      await user.save();

      const revenue = await updateSessionRevenue(
        userEmail,
        areaName,
        sessionDate
      );

      if (failedPayments.length > 0) {
        return res.status(207).json({
          message: `Some payments were unsuccessful.`,
          totalPaid: totalPaidAmount,
          sessionRevenue: revenue,
          failedPayments,
        });
      }

      res.status(200).json({
        message: `All payments successful.`,
        totalPaid: totalPaidAmount,
        sessionRevenue: revenue,
      });
    } catch (error) {
      console.error("Error during bulk payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete All Players
app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players",
  async (req, res) => {
    try {
      const { userEmail, areaName, sessionDate } = req.params;

      // Find the user
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      // Decode URL components
      const decodedAreaName = decodeURIComponent(areaName);
      const decodedSessionDate = decodeURIComponent(sessionDate);

      // Find the area
      const area = user.areas.find((area) => area.name === decodedAreaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      // Find the session
      const session = area.sessions.find(
        (s) => s.sessionDate === decodedSessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      // Clear players and history if they exist
      session.players = [];
      session.playerHistory = [];

      await user.save();

      res
        .status(200)
        .json({ message: "All players deleted successfully", session });
    } catch (error) {
      console.error("Error deleting all players:", error.message);
      res.status(500).json({ error: "Failed to delete all players" });
    }
  }
);

// Fetch players within a specific session in a user's area
app.get(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players",
  async (req, res) => {
    const { userEmail, areaName } = req.params;
    const sessionDate = decodeURIComponent(req.params.sessionDate);
    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      res.status(200).json(session.players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  }
);

app.get(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/playerHistory",
  async (req, res) => {
    const { userEmail, areaName } = req.params;
    const sessionDate = decodeURIComponent(req.params.sessionDate);
    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      res.status(200).json(session.playerHistory);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  }
);

// Create a new match in session ///////////////////////////////////////////////////////////////////////
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/matches",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;
    const matchData = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      session.matches.push(matchData);

      await user.save();

      res
        .status(201)
        .json({ message: "Match created successfully", matches: matchData });
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ error: "Failed to create match" });
    }
  }
);

//get all matches
app.get(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/matches",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      res.status(200).json(session.inMatch);
    } catch (error) {
      console.error("Error retrieving matches:", error);
      res.status(500).json({ error: "Failed to retrieve matches" });
    }
  }
);

//Delete match from session
app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/matches/:matchId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, matchId } = req.params;
    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      session.matches.id(matchId).remove();
      await user.save();

      res.status(200).json({ message: "Match deleted successfully" });
    } catch (error) {
      console.error("Error deleting match:", error);
      res.status(500).json({ error: "Failed to delete match" });
    }
  }
);

app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/matches",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === decodeURIComponent(sessionDate)
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      // Clear the inMatch array
      session.matches = [];
      await user.save();

      res.status(200).json({ message: "All matches deleted successfully" });
    } catch (error) {
      console.error("Error deleting matches:", error);
      res.status(500).json({ error: "Failed to delete matches" });
    }
  }
);

// Get all InMatches in session///////////////////////////////////////////////////////////////////////////
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/inMatch",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;
    const matchData = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      session.inMatch.push(matchData);

      await user.save();

      res
        .status(201)
        .json({ message: "Match created successfully", match: matchData });
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ error: "Failed to create match" });
    }
  }
);

//Edit inMatch
app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/inMatch/:matchId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, matchId } = req.params;
    const { team1, team2 } = req.body;

    console.log("Received request:");
    console.log("Email:", req.params.email);
    console.log("Area Name:", req.params.areaName);
    console.log("Session Date:", req.params.sessionDate);
    console.log("Match ID:", req.params.matchId);

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      const matchIndex = session.inMatch.findIndex(
        (m) => m._id.toString() === matchId
      );

      if (matchIndex === -1)
        return res.status(404).json({ error: "Match not found" });

      if (!Array.isArray(team1) || !Array.isArray(team2)) {
        return res
          .status(400)
          .json({ error: "Invalid team data. Teams should be arrays." });
      }

      session.inMatch[matchIndex].team1 = team1;
      session.inMatch[matchIndex].team2 = team2;

      await user.save();

      res.status(200).json({
        message: "Match updated successfully",
        match: session.inMatch[matchIndex],
      });
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(500).json({
        error: error.message || "Failed to update match",
      });
    }
  }
);

//get all inMatches
app.get(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/inMatch",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      res.status(200).json(session.inMatch);
    } catch (error) {
      console.error("Error retrieving inMatch:", error);
      res.status(500).json({ error: "Failed to retrieve inMatch" });
    }
  }
);

app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/inMatch",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === decodeURIComponent(sessionDate)
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      // Clear the inMatch array
      session.inMatch = [];
      await user.save();

      res.status(200).json({ message: "All matches deleted successfully" });
    } catch (error) {
      console.error("Error deleting matches:", error);
      res.status(500).json({ error: "Failed to delete matches" });
    }
  }
);

//Delete inMatchId
app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/inMatch/:inMatchId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, inMatchId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const matchIndex = session.inMatch.findIndex(
        (match) => match._id.toString() === inMatchId
      );
      if (matchIndex === -1) {
        return res.status(404).json({ error: "Match not found" });
      }

      session.inMatch.splice(matchIndex, 1);

      await user.save();

      res.status(200).json({ message: "All players deleted successfully" });
    } catch (error) {
      console.error("Error deleting all players:", error);
      res.status(500).json({ error: "Failed to delete all players" });
    }
  }
);

// CourtId
app.get(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/courts/:courtId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, courtId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const area = user.areas.find((a) => a.name === areaName);
      if (!area) {
        return res.status(404).json({ message: "Area not found" });
      }

      const session = area.sessions.find((s) => s.date === sessionDate);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const court = session.courts.find(
        (court) => court._id.toString() === courtId
      );
      if (!court) {
        return res.status(404).json({ message: "Court not found" });
      }

      res.status(200).json(court);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/:playerId/addBall",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;
    const { ball } = req.body;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ error: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const decodedSessionDate = decodeURIComponent(sessionDate);
      const session = area.sessions.find(
        (session) => session.sessionDate === decodedSessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      const player = session.players.id(playerId);
      if (!player)
        return res.status(404).json({ error: "Player not found in session" });

      const playerHistory = session.playerHistory.id(playerId);
      if (!playerHistory)
        return res
          .status(404)
          .json({ error: "Player not found in playerHistory" });

      if (ball !== undefined) {
        player.ball = (player.ball || 0) + ball;
        playerHistory.ball = (playerHistory.ball || 0) + ball;
      }

      await user.save();
      res
        .status(200)
        .json({ message: "Ball count updated successfully", player });
    } catch (error) {
      console.error("Error adding ball to player:", error);
      res.status(500).json({ error: "Failed to update ball count" });
    }
  }
);

app.put(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/players/:playerId/updateStats",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, playerId } = req.params;
    const { winIncrement, lossIncrement } = req.body;

    try {
      // 👉 Use projection to reduce payload (only fetch needed fields)
      const user = await UserModel.findOne(
        { email: userEmail },
        "areas.name areas.sessions.sessionDate areas.sessions.players areas.sessions.playerHistory"
      );
      if (!user) return res.status(404).json({ error: "User not found" });

      // 👉 Use .find() once instead of multiple lookups
      const area = user.areas.find((a) => a.name === areaName);
      if (!area) return res.status(404).json({ error: "Area not found" });

      const decodedSessionDate = decodeURIComponent(sessionDate);
      const session = area.sessions.find(
        (s) => s.sessionDate === decodedSessionDate
      );
      if (!session) return res.status(404).json({ error: "Session not found" });

      const player = session.players.id(playerId);
      const playerHistory = session.playerHistory.id(playerId);

      if (!player || !playerHistory) {
        return res.status(404).json({
          error: !player
            ? "Player not found in session"
            : "Player not found in playerHistory",
        });
      }

      // 👉 Use ||= or || 0 to avoid NaN issues
      if (winIncrement !== undefined) {
        player.win = (player.win || 0) + winIncrement;
        playerHistory.win = (playerHistory.win || 0) + winIncrement;
      }

      if (lossIncrement !== undefined) {
        player.loss = (player.loss || 0) + lossIncrement;
        playerHistory.loss = (playerHistory.loss || 0) + lossIncrement;
      }

      // 🔥 save only the subdocument that changed, if possible
      await user.save(); // still saving whole doc, but needed due to nested subdocs

      res.status(200).json({
        message: "Player stats updated successfully",
        player,
      });
    } catch (error) {
      console.error("Error updating player stats:", error);
      res.status(500).json({ error: "Failed to update stats" });
    }
  }
);

// Route to delete a court by ID
app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/courts/:courtId",
  async (req, res) => {
    const { userEmail, areaName, sessionDate, courtId } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) return res.status(404).json({ message: "User not found" });

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) return res.status(404).json({ message: "Area not found" });

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session)
        return res.status(404).json({ message: "Session not found" });

      const courtIndex = session.courts.findIndex(
        (court) => court._id.toString() === courtId
      );
      if (courtIndex === -1)
        return res.status(404).json({ message: "Court not found" });

      session.courts.splice(courtIndex, 1);

      await user.save();

      res.status(200).json({ message: "Court deleted successfully" });
    } catch (error) {
      console.error("Error deleting court:", error);
      res.status(500).json({ message: "Failed to delete court" });
    }
  }
);

app.delete(
  "/users/:userEmail/areas/:areaName/sessions/:sessionDate/courts",
  async (req, res) => {
    const { userEmail, areaName, sessionDate } = req.params;

    try {
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const area = user.areas.find((area) => area.name === areaName);
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }

      const session = area.sessions.find(
        (session) => session.sessionDate === sessionDate
      );
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      session.courts = [];

      await user.save();

      res.status(200).json({ message: "All players deleted successfully" });
    } catch (error) {
      console.error("Error deleting all players:", error);
      res.status(500).json({ error: "Failed to delete all players" });
    }
  }
);

app.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const user = await UserModel.findOne({ refreshToken });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token." });

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error." });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
