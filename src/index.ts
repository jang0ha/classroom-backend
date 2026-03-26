import express from "express";
import subjectRouters from "./route/subjects.js";
import cors from "cors";

const app = express();
const PORT = 8000;
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/subjects", subjectRouters);

app.get("/", (_req, res) => {
  res.json({ message: "Classroom API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
