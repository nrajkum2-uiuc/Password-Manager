'use strict'
require('dotenv').config()
const prompt = require('prompt')
const colors = require('colors/safe')

const util = require('./util')
prompt.start()

prompt.get({
    name: 'action',
    message: 's to select a password, a to edit or add a password, d to delete a password',
    type: 'string',
    require: true,
    conform: function(action) {
        let actionCase = action.toUpperCase()
        if(actionCase !== 'A' && actionCase !== 'S' && actionCase !== 'D') {
            return false
        }
        return true
      }
}, function(err, result) {
    let action = result.action.toUpperCase()
    switch(action) {
        case 'A':
            addPassword()
        case 'D':
            deletePassword()
        case 'S':
            selectPassword()
    }
})

function selectPassword() {
    prompt.get({
        name: 'service',
        message: 'Enter the service you\'d like to receive your password for',
        require: true,  
    }, function(err, result) {
        const service = result.service
        const passwordsInfo = util.loadPasswordsInfoFromFile(service)
        if(passwordsInfo.length === 1) {
            util.copyPasswordToClipboard(passwordsInfo[0].password)
            console.log(util.passwordInfoToString(passwordsInfo[0].service, passwordsInfo[0].username))
            return
        }
        chooseFromSelections(passwordsInfo, 'select')
    })
}

function deletePassword() {
    prompt.get({
        name: 'service',
        message: 'Enter the service you\'d like to delete a password for',
        require: true,
    }, function(err, result) {
        const service = result.service
        const passwordsInfo = util.loadPasswordsInfoFromFile(service)
        if(passwordsInfo.length === 1) {
            util.removePassword(passwordsInfo[0].service)
            console.log(util.passwordInfoToString(passwordsInfo[0].service, passwordsInfo[0].username))
            return
        }
        chooseFromSelections(passwordsInfo, 'delete')
    })
}

function chooseFromSelections(passwordsInfo, action) {
    _.forEach(passwordsInfo, (passwordInfo) => {
        console.log(`${passwordInfo.service}\t|\t${passwordInfo.username}`)
    })
    prompt.get({
        name: 'selection',
        message: 'Enter a selection 1-5:',
        type: 'number',
        conform: function(selection) {
            return selection >=1 && selection <=5
        }
    }, function(err, result) {
        const selection = result.selection
        console.log(selection)
        if(action === 'delete') {
            util.removePassword(util.removePassword(passwordsInfo[selection].service))
        } else if(action === 'select') {
            console.log(`Selected password for: ${passwordsInfo.service}`)
            const decryptedPassword = util.decryptPassword(passwordsInfo[selection].password)
            util.copyPasswordToClipboard(decryptedPassword)
        } else {
            throw Error('Sumfing went wrong')
        }
    })
}

function addPassword() {
    const passwordInfo = {}

    const finished = function*() { yield; return true }
    const insertFlow = {
        s: enterService, // returns 's' or 'e'
        e: enterUsername, // returns 's' or 'p'
        p: enterPassword, // returns 'e' or 'f'
        f: finished, // returns true
        q: finished // returns true
    }

    let fn = insertFlow.s(passwordInfo)
    let fnKey = fn.next()
    console.log(fnKey, 'nit')
    while(fnKey !== true) {
        fnKey = fn.next().value
        console.log(fnKey)
        fn = insertFlow[fnKey](passwordInfo)
        fnKey = fn.next()
    }

    if(fnKey === 'q') {
        console.log('Quit!')
        return
    }

    const encrPassword = util.encryptPassWord(passwordInfo.password)
    util.savePasswordInfoToFile(encrPassword, passwordInfo.username, passwordInfo.service)
    console.log('bigga')
    console.log(`Added ${util.passwordInfoToString(passwordInfo.service, passwordInfo.username)}`)
}

function * enterService(passwordInfo) {
    let step = 'q'
    console.log('nit')
    
    prompt.get({
        name: 'service',
        message: 'Enter the service name or q to quit',
        type: 'string',
    }, function(err, result) {
        if(result.service === 'q') {
            return // quit
        } else {
            step = 'e'
            passwordInfo.service = result.service
        }
        console.log('bru')
    },  () => enterPassword.next())
    yield
    console.log('ooo')

    return step
}

function enterUsername(passwordInfo) {
    let step = 'q'
    prompt.get({
        name: 'username',
        message: 'Enter the username, q to quit, or b to go back',
        type: 'string',
    }, function(err, result) {
        if(result.username === 'q') {
            return // quit
        } else if(result.username === 'b') {
            step = 's'
            return 
        } else {
            step = 'p'
            passwordInfo.username = result.username
        }
    })

    return step
}

function enterPassword(passwordInfo) {
    let step = 'q'
    prompt.get({
        name: 'password',
        message: 'Enter the password, q to quit, or b to go back',
        type: 'string',
    }, function(err, result) {
        if(result.password === 'q') {
            return // quit
        } else if(result.password === 'b') {
            step = 'u'
            return 
        } else {
            step = 'f'
            passwordInfo.password = result.password
        }
    })

    return step
}