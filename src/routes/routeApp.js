const express = require("express")
const { expertSystem, readSymptomList, readDiseaseList, createDieaseAndFactList, record } = require("../controllers/expertController")

const router = express.Router()

router.use((req, res, next) => {
    // authentication process here
    // if success
    next()
    // if fail res.json(response({ success: false, message: "Username or password does not match!" }))
})

router.get("/", (req, res) => res.send("Welcome to the API."))

router.get("/symptoms", readSymptomList)

router.post("/experts", expertSystem)

router.get("/diseases", readDiseaseList)

router.post("/diseases", createDieaseAndFactList)

router.get("/records", record)

// router.get("/test", test)

module.exports = router