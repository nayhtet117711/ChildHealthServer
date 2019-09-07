const response = ({ success=true, message="Success", payload=null }) => ({ success, message, payload })

const errResponse = messageOriginal => {
    const message = messageOriginal.code=="ER_DUP_ENTRY" ? "Username already exist!" 
        : messageOriginal
    return response({ success: false, message })
}

module.exports = { response, errResponse }