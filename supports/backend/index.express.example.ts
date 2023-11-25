import express from "express";
import path from "path";
import prisma from "./prisma";

const app = express();
const port = 3000;

//allow cors on non-production environments
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
  });
}

app.get("/api/test", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/users", async (req, res) => {
  const data = await prisma.users.findMany();
  res.json(data);
});

//serve static assets if in production
if (process.env.NODE_ENV === "production") {
  console.log("serving static file for production use");
  app.use(express.static(path.join(__dirname, "client")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
