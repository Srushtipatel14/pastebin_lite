require("dotenv").config();
const express = require("express");
const cors = require("cors")
const apiRoutes =require("./src/routes/apiroute")
const linkRoutes=require("./src/routes/linkroute")
const app = express();
app.use(express.json());
app.use(cors())

app.use("/api",apiRoutes)
app.use("/p",linkRoutes)

app.listen(process.env.PORT)