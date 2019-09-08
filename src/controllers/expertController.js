const { response } = require("../generic")
const engine = require("../logics/ruleEngine")

const expertSystem = (req, res) => {
    const symptoms = req.body.symptoms
    const childAge = req.query.childAge
    res.json(response({ 
        payload: engine.run(childAge, symptoms)
    }))
}

const readSymptomList = (req, res) => {
    const childAge = req.query.childAge
    const symptomList = engine.readSymptomList(childAge);
    res.json(response({
        payload: symptomList
    }))
}

module.exports = { 
    expertSystem,
    readSymptomList
}