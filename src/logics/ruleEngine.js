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

const run = (symptoms) => {
    const rules = readJsonRules()

    const result = doJob(symptoms, rules)
    return ({ result })
}

const readSymptomList = () => {
    const rules = readJsonRules()
    return rules.reduce((r, rfile) => {
        return [...r, ...rfile.rules.reduce((r, rule) => {
            return [...r, ...rule.fact.map(f => ({ name: f.name, type: f.value1 ? "integer" : "boolean" }))]
        }, [])
        ]
    }, [])
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

const doJob = (symptoms, ruleList) => {
    return ruleList.reduce((r, rules) => {
        const name = rules.name
        const result = rules.rules.filter(rule => {
            if (rule.fact.length !== symptoms.length) return false
            const stage = rule.stage
            const advice = rule.advice
            const emergency = rule.emergency
            const r = rule.fact.filter(f => {
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
                return s.length > 0
            })
            return r.length === rule.fact.length
        })
        if (result.length > 0) {
            const found = result[0]
            return ({ name, stage: found.stage, advice: found.advice, emergency: found.emergency })
        } else return null
    }, null)
}

module.exports = { run, readSymptomList }