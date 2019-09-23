const { response } = require("../generic")
const engine = require("../logics/ruleEngine")

const expertSystem = (req, res) => {
    const symptoms = req.body.symptoms
    const childAge = req.query.childAge

    engine.run(childAge, symptoms, req, (result) => {

        res.json(response({
            payload: result
        }))

    })

}

const readSymptomList = (req, res) => {
    const childAge = req.query.childAge
    engine.readSymptomList(childAge, req, symptomList => {
        res.json(response({
            payload: symptomList
        }))
    });
}


const test = (req, res) => {
    engine.readRulesFromDatabase(req, res)
}

module.exports = {
    expertSystem,
    readSymptomList,
    test
}