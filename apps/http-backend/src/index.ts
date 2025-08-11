import express from "express";
import router from "./router";

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use('/api/v1', router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
}); 