import express from "express";
const app = express();
app.get("/", (req, res) => {
});
app.listen(8000, () => {
    console.log("Sever is listening on https://localhost:8000");
});
