const express = require("express");
const router = express.Router();

const {healthFunction} =require("../controllers/healthAPI");
const {createPaste}=require("../controllers/createPaste");
const {getPaste} =require("../controllers/getPaste")


router.get("/healthz",healthFunction);
router.post("/pastes",createPaste )
router.get("/pastes/:id",getPaste );

module.exports = router;
