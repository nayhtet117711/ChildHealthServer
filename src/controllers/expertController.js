const { response } = require("../generic")
const engine = require("../logics/ruleEngine")

const expertSystem = (req, res) => {
    const symptoms = req.body.symptoms
    const username = req.body.username
    const childAge = req.query.childAge

    engine.run(childAge, symptoms, req, (result) => {
        // console.log("result: ", result)

        if(result!==null) {

            const newRecord = {
                username: username,
                disease: result.result.name,
                childage: childAge,
                datee: new Date().toISOString().split("T")[0]
            }
            // console.log(newRecord)
            req.getConnection((err, con) => {
                if(err) res.json(errResponse(err))
                else {
                    con.query("insert into record set ?", newRecord, (error, results) => {
                        if(error) console.log(error)
                    })
                }
            })   
        }

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

    // console.log(req.body)

    engine.createDieaseAndFactList(diseaseName, childAge, factList, req, (message) => {
        return res.json(response({
            message
        }));
    })

}

const record = (req, res) => {
    const loginAccount = {
        username: req.query.username
    }
    
    req.getConnection((err, con) => {
        if(err) res.json(errResponse(err))
        else {
            con.query("select * from record where username=? order by datee desc", [ loginAccount.username ], (error, results) => {
                // console.log({ error, results })
                if(error) {
                    // console.log(errResponse(error))
                    res.json(errResponse(error))
                }
                // else if(results.length >0) {
                res.json(response({  
                    payload: results
                }))
                // } 
            })
        }
    })
    
}

const test = (req, res) => {
    engine.readRulesFromDatabase(req, res)
}

module.exports = {
    record,
    expertSystem,
    readSymptomList,
    readDiseaseList,
    createDieaseAndFactList,
    test,
}