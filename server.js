// server.js

const express = require("express");
const http = require("http");
const path = require("path");
const session = require("express-session");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ----- MIDDLEWARE -----

// Parse POST form bodies
app.use(express.urlencoded({ extended: true }));

// Sessions (for login state)
app.use(
  session({
    secret: "pb-store-chat-secret-key", // any random string
    resave: false,
    saveUninitialized: false,
  })
);

// ---- PREDEFINED USERS ----
const validUsers = {
  parth: "PKB@kamalbhai",
  priyanka: "PNP@nareshbhai",
  yash: "YNP@nareshbhai",
  kamalbhai: "KVB@virjibhai",
  nareshbhai: "NMP@manekbhai",
  hansaben: "HKB@rambhai",
  harshidaben: "HNP@baldevbhai"
};

// ----- ROUTES -----

// Show login page (index.html inside /public)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle login POST
app.post("/login", (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();

  const correctPassword = validUsers[username];

  if (correctPassword && password === correctPassword) {
    // Mark as logged in
    req.session.user = { username };
    return res.redirect("/chat");
  }

  // Wrong credentials → back to login with ?error=1
  return res.redirect("/?error=1");
});

// Protected chat page
app.get("/chat", (req, res) => {
  if (!req.session.user) {
    // Not logged in → back to login
    return res.redirect("/");
  }

  // Send chat.html from root
  res.sendFile(path.join(__dirname, "chat.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ----- STATIC FILES -----
// For any extra files inside /public (CSS, JS, images)
// (index.html is already served by the / route above)
app.use(express.static(path.join(__dirname, "public")));

// ----- SOCKET.IO -----
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // data = { displayName, message }
  socket.on("chat-message", (data) => {
    io.emit("chat-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ----- START SERVER -----
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("PB Store Chat running at http://localhost:" + PORT);
});
