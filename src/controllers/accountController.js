const { response, errResponse } = require("../generic")

const login = (req, res) => {
    const loginAccount = {
        username: req.body.username,
        password: req.body.password
    }
    
    req.getConnection((err, con) => {
        if(err) res.json(errResponse(err))
        else {
            con.query("select * from account where username=? and password=?", [ loginAccount.username, loginAccount.password ], (error, results) => {
                console.log({ error, results })
                if(error) {
                    console.log(errResponse(error))
                    res.json(errResponse(error))
                }
                else if(results.length >0) {
                    const userAccount = {
                        username: results[0].username,
                        name: results[0].name,
                        phone: results[0].phone,
                        role: results[0].role
                    }
                    res.json(response({  
                        payload: { userAccount }
                    }))
                } else res.json(errResponse("Username or password does not match "))
            })
        }
    })
    
}

const register = (req, res) => {
    const newAccount = {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        phone: req.body.phone,
        role: "user"
    }
    req.getConnection((err, con) => {
        if(err) res.json(errResponse(err))
        else {
            con.query("insert into account set ?", newAccount, (error, results) => {
                if(error) res.json(errResponse(error))
                else res.json(response({ 
                    message: "Your user account is created.", 
                    payload: { next: "/accouts/login" }
                }))
            })
        }
    })    
}

module.exports = { 
    login, 
    register 
}