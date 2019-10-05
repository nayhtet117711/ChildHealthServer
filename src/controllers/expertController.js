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

const readDiseaseList = (req, res) => {
    engine.readDiseaseList(req, diseaseList => {
        res.json(response({
            payload: diseaseList
        }))
    });
}

const createDieaseAndFactList = (req, res) => {
    const diseaseName = req.body.diseaseName
    const childAge = req.body.childAge
    const factList = req.body.factList

    console.log(req.body)

    engine.createDieaseAndFactList(diseaseName, childAge, factList, req, (message) => {
        return res.json(response({
            message
        }));
    })

}

const test = (req, res) => {
    engine.readRulesFromDatabase(req, res)
}

module.exports = {
    expertSystem,
    readSymptomList,
    readDiseaseList,
    createDieaseAndFactList,
    test,
}