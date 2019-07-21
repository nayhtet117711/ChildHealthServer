const { response } = require("../generic")
const engine = require("../logics/ruleEngine")

const expertSystem = (req, res) => {
    const symptoms = req.body.symptoms
    res.json(response({ 
        payload: engine.run(symptoms)
    }))
}

const readSymptomList = (req, res) => {
    const symptomList = engine.readSymptomList();
    res.json(response({
        payload: symptomList
    }))
}

module.exports = { 
    expertSystem,
    readSymptomList
}