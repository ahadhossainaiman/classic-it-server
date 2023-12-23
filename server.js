const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 8000;
// const connectDB = require("./db/dbConnection");
// const User = require("./db/user");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion } = require("mongodb");
//Middleware for parsing JSON
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("server Running");
});

const uri =
  "mongodb+srv://ahad1:LtS5oWD9dFYOW5DA@cluster1.gvlvc6q.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db("classic-it").collection("users");

    app.post("/register", async (req, res) => {
      const { email, password, username, photoUrl } = req.body;
      const existingUser = await userCollection.findOne({ username });
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await userCollection.insertOne({
        username,
        email,
        photoUrl,
        password: hashedPassword,
      });

      res.status(201).send("User registered successfully!");
    });

    // Login
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await userCollection.findOne({ email });
        console.log(user);

        if (user) {
          // Compare the entered password with the hashed password in the database
          const passwordMatch = await bcrypt.compare(password, user.password);
          console.log(passwordMatch);
          if (passwordMatch) {
            res.status(200).json({ message: "Login successful!" });
          } else {
            res.status(401).json({ message: "Invalid credentials" });
          }
        } else {
          res.status(401).json({ message: "Invalid credentials" });
        }
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    app.get("/user", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      console.log(result);
      res.send(result);
    });
    app.post;
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

//Registration
// app.post("/register", async (req, res) => {
//   try {
//     const { username, password, email, photoUrl } = req.body;
//     console.log(username, password, email, photoUrl);
//     const user = new User({ username, password, email, photoUrl });
//     await user.save();
//     res.status(201).json({ message: "Registration SuccessFull" });
//   } catch (error) {
//     res.status(500).json({ error: "Registration Fail" });
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid username or Password" });
//     }
//     if (user.password !== password) {
//       return res.status(401).json({ error: "Invalid Username or Password" });
//     }
//     res.status(200).json({ message: "Login SuccessFully" });
//   } catch (error) {
//     res.status(500).json({ error: "Login Failed" });
//   }
// });

// connectDB();
app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
