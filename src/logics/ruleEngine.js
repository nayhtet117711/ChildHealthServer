const fs = require("fs")
const path = require("path")

const OPERATOR = {
    equal: "=",
    greaterThan: ">",
    greaterThanEqual: ">=",
    lessThan: "<",
    lessThanEqual: "<=",
    between: "><",
    betweenInclusive: ">=<=",
}

const readRulesFromDatabase = (req, callback) => {
    req.getConnection((err, con) => {
        if (err) res.json(errResponse(err))
        else {
            const query1 = `select * from rule`
            con.query(query1, (error1, results1) => {
                const ruleList = [...results1]

                const query2 = `select * from ruleItem`
                con.query(query2, (error2, results2) => {
                    const ruleItemList = [...results2]
                    const query3 = `select * from fact`
                    con.query(query3, (error3, results3) => {
                        const factList = [...results3]

                        const resultedRuleList = ruleList.map(v1 => {
                            const V1 = { ...v1 }
                            V1.childAge = v1.childAge.split(",")
                            V1.rules = ruleItemList
                                .filter(v2 => v2.ruleName === v1.name)
                                .map(v3 => {
                                    const V2 = { ...v3 }
                                    V2.fact = factList.filter(v4 => v4.ruleName === v3.ruleName && v4.ruleItemId === v3.id)
                                        .map(v5 => (
                                            {
                                                name: v5.name,
                                                operator: v5.operator === "undefined" ? undefined : v5.operator,
                                                value1: v5.value1 === "undefined" ? undefined : v5.value1,
                                                value2: v5.value2 === "undefined" ? undefined : v5.value2,
                                            }))
                                    return V2
                                })


                            return V1
                        })

                        callback(resultedRuleList)

                    })
                })
            })
        }
    })
}

/*
const moveJsonFileToDatabase = (req) => {
    const ruleList = readJsonRules()

    req.getConnection((err, con) => {
        if (err) res.json(errResponse(err))
        else {

            ruleList.forEach(rules => {
                const name = rules.name
                const childAge = rules.childAge.reduce((r, c, i) => i === 0 ? r + c : r + "," + c, "")
                const query1 = `insert into rule(name, childAge) values('${name}','${childAge}')`

                con.query(query1, (error1, results1) => {

                    rules.rules.forEach(rule => {

                        const stage = rule.stage
                        const advice = rule.advice

                        const query2 = `insert into ruleItem(stage, advice, ruleName) values('${stage}','${advice}','${name}')`
                        con.query(query2, (error2, results2) => {

                            const ruleId = results2.insertId

                            rule.fact.forEach(fact => {

                                const query3 = `insert into fact(name, ruleItemId, ruleName, operator, value1, value2) values('${fact.name.toLowerCase()}','${ruleId}','${name}','${fact.operator}','${fact.value1}','${fact.value2}')`
                                con.query(query3, (error3, results3) => {
                                    // console.log(error3, results3)
                                })
                            })


                        })

                    })

                })
            })
        }

    })
}
*/


const run = (childAge, symptoms, req, callback) => {
    // const rules = readJsonRules()

    readRulesFromDatabase(req, rules => {
        const result = doJob(childAge, symptoms, rules)
        callback({ result })
    })

    // return ({ result })
}

const readSymptomList = (childAge, req, callback) => {
    // const rules = readJsonRules()

    readRulesFromDatabase(req, rules => {
        const symptomsList = rules.reduce((r, rfile) => {
            const isFromAgeList = rfile.childAge.filter(vv => vv === childAge)
            if (isFromAgeList.length === 0) return r
            return [...r, ...rfile.rules.reduce((r, rule) => {
                return [...r, ...rule.fact.map(f => ({ name: f.name, type: f.value1 ? "integer" : "boolean" }))]
            }, [])
            ]
        }, [])
        callback(symptomsList)
    })

    // return rules.reduce((r, rfile) => {
    //     const isFromAgeList = rfile.childAge.filter(vv => vv === childAge)
    //     if (isFromAgeList.length === 0) return r
    //     return [...r, ...rfile.rules.reduce((r, rule) => {
    //         return [...r, ...rule.fact.map(f => ({ name: f.name, type: f.value1 ? "integer" : "boolean" }))]
    //     }, [])
    //     ]
    // }, [])
}

const readDiseaseList = (req, callback) => {
    readRulesFromDatabase(req, rules => {
        const diseaseList = rules.map(v => v.name)
        callback(diseaseList)
    })
}

createDieaseAndFactList = (diseaseName, childAge, factList, req, callback) => {
   
    readDiseaseList(req, diseaseList => {
        const exists = diseaseList.filter(v => v === diseaseName).length > 0

        if (!exists) {
            req.getConnection((err, con) => {
                if (err) res.json(errResponse(err))
                else {
                    const query1 = `insert into rule(name, childAge) values('${diseaseName}', '${childAge}')`
                    con.query(query1, (error1, results1) => {
                        const diseaseId = results1.insertId

                        const query2 = `insert into ruleItem(ruleName, stage, advice) values('${diseaseName}', 1, '')`
                        con.query(query2, (error2, results2) => {
                            // console.log(error1, results2)
                            const ruleId = results2.insertId

                            const insQuery = factList.reduce((r,c,i) => {
                                if(i===0) return r+`('${diseaseName}', ${ruleId}, '${c}')`
                                else return r+`,('${diseaseName}', ${ruleId}), '${c}')`
                            }, "")

                            // console.log("insQuery: ", insQuery)

                            const query3 = `insert into fact(ruleName, ruleItemId, name) values ${insQuery}`
                            con.query(query3, (error3, results3) => {
                                console.log("2: ", error3, results3)
                                callback("Rule is added success fully.")
                            })

                        })

                    })
                }
            })
        }
        else {
            req.getConnection((err, con) => {
                if (err) res.json(errResponse(err))
                else {
                    const query2 = `insert into ruleItem(ruleName, stage, advice) values('${diseaseName}', 1, '')`
                        con.query(query2, (error2, results2) => {
                            // console.log(error1, results2)
                            const ruleId = results2.insertId

                            const insQuery = factList.reduce((r,c,i) => {
                                if(i===0) return r+`('${diseaseName}', ${ruleId}, '${c}')`
                                else return r+`,('${diseaseName}', ${ruleId}, '${c}')`
                            }, "")

                            // console.log("insQuery: ", insQuery)

                            const query3 = `insert into fact(ruleName, ruleItemId, name) values ${insQuery}`
                            con.query(query3, (error3, results3) => {
                                console.log("2: ", error3, results3)
                                callback("Rule is added success fully.")
                            })

                        })
                }
            })
        }

    })
}

const readJsonRules = () => {
    const ruleFiles = fs.readdirSync(path.join(__dirname, "json-rules"))
    const ruleList = ruleFiles.reduce((r, f) => {
        if (path.extname(f) !== ".json") return r
        const rRaw = fs.readFileSync(path.join(__dirname, "json-rules", f))
        const rule = JSON.parse(rRaw)
        return [...r, rule]
    }, [])
    return ruleList
}

const doJob = (childAge, symptoms, ruleList) => {
    return ruleList.reduce((r, rules) => {
        const name = rules.name
        const isFromAgeList = rules.childAge.filter(vv => vv === childAge)
        if (isFromAgeList.length === 0) return r
        const result = rules.rules.reduce((rrrrr, rule) => {
            //if (rule.fact.length !== symptoms.length) return false
            const stage = rule.stage
            const advice = rule.advice
            const emergency = rule.emergency

            const r = rule.fact.reduce((rrr, f) => {
                const {
                    name,
                    operator = OPERATOR.equal,
                    value1 = true,
                    value2 = null
                } = f
                const s = symptoms.filter(ss => {
                    const s = { ...ss }
                    s.value = s.value === undefined ? true : s.value
                    if (s.name != name) return false
                    else if (operator === OPERATOR.equal) return s.value === value1
                    else if (operator === OPERATOR.lessThan) return s.value < value1
                    else if (operator === OPERATOR.lessThanEqual) return s.value <= value1
                    else if (operator === OPERATOR.greaterThan) return s.value > value1
                    else if (operator === OPERATOR.greaterThanEqual) return s.value >= value1
                    else if (operator === OPERATOR.between) return s.value > value1 && s.value < value2
                    else if (operator === OPERATOR.betweenInclusive) return s.value >= value1 && s.value <= value2
                    else return false
                })

                if (s.length === 0) return rrr
                else {
                    return [...rrr, s[0]]
                }
            }, [])
            if (r.length > 0) {
                return [...rrrrr, { name, fact: r }]
            } else return rrrrr
        }, [])

        if (result.length > 0) {
            result.sort((l, r) => r.fact.length - l.fact.length)

            const found = result[0]
            const foundRule = ({ name, stage: found.stage, advice: found.advice, emergency: found.emergency, fact: found.fact })
            if (r === null) return foundRule
            else if (foundRule.fact.length > r.fact.length) return foundRule
            else return r
        } else return r
    }, null)
}

module.exports = { run, readSymptomList, readRulesFromDatabase, readDiseaseList, createDieaseAndFactList }