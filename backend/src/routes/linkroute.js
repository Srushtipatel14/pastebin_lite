const express = require("express");
const router = express.Router();
const {getLink}=require("../controllers/getLink");

router.get("/:id",getLink);

module.exports = router;