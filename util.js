'use strict'
const _ = require('lodash')
var CryptoJS = require("crypto-js")
const parse = require('csv-parse/lib/sync')
var pbcpy = require('child_process').spawn('pbcopy');
const fs = require('fs')
 



const passwordFilePath = process.env.PASSWORDS_FILE_PATH
const privateKeyFilePath = process.env.PRIVATE_KEY_FILE_PATH


const util = module.exports

const getPrivateKey = () => fs.readFileSync(privateKeyFilePath).toString()

util.encryptPassWord = (password) => CryptoJS.AES.encrypt(password, getPrivateKey()).toString();

util.decryptPassword = (encrpassword) => CryptoJS.AES.decrypt(encrpassword, getPrivateKey()).toString(CryptoJS.enc.Utf8)

util.savePasswordInfoToFile =  (encrPassword, username, service) => {
    const passwordsToSave = []
    const strToWrite = `"${service}",${username},${encrPassword}`

    const passwordsInfoStream = fs.readFileSync(passwordFilePath);
    const passwordsInfo = parse(passwordsInfoStream, {})

    let found = false
    _.forEach(passwordsInfo, (passwordInfo) => {

        if(!found && passwordInfo[0] === `"${service}"` && passwordInfo[1] === `"${username}"`) {
            passwordsToSave[idx] = strToWrite
            found = true
        }
    })

    if(!found) {
        passwordsToSave.push(strToWrite)
    }
    const fileStr = passwordsToSave.join('\n')

    fs.truncateSync(passwordFilePath)
    fs.writeFileSync(passwordFilePath, fileStr)

    return strToWrite
}

util.removePassword = (service) => {
    const matchedServicesAndPasswords = []

    const passwordsInfoStream = fs.readFileSync(passwordFilePath)
    const passwordsInfo = parse(passwordsInfoStream, {})

    for(let i = 0; i < passwordsInfo.length; i++) {
        const passwordInfo = passwordsInfo[i]
        if(passwordInfo[0].toUpperCase() === service.toUpperCase()) {
            passwordsInfo.splice(i)
            break
        }
    }
}

util.loadPasswordsInfoFromFile = (service) => {
    const matchedServicesAndPasswords = []

    const passwordsInfoStream = fs.readFileSync(passwordFilePath)
    const passwordsInfo = parse(passwordsInfoStream, {})
    
    _.forEach(passwordsInfo, (passwordInfo) => {
        if(passwordInfo[0].toUpperCase().includes(service.toUpperCase())) {
            console.log(passwordsInfo)
            matchedServicesAndPasswords.push({
                service: passwordInfo[0],
                username: passwordInfo[1],
                password: util.decryptPassword(passwordInfo[2])
            })
        }
    })

    return matchedServicesAndPasswords
}

util.passwordInfoToString = (service, username) => `The password for ${service} with account: ${username} has been copied to your clipboard`


util.copyPasswordToClipboard = function(password) {
    pbcpy.stdin.write(password);
    pbcpy.stdin.end();
}