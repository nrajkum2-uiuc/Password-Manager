'use strict'

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
        if(action !== 'A' && action !== 'S' && action !== 'D') {
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
            util.copyPasswordToClipboard()
            console.log(util.selectedPasswordInfo(passwordsInfo[0].service, passwordsInfo[0].service))
            return
        }
        chooseFromSelections()
    })
}

function chooseFromSelections() {
    prompt.get({
        name: 'selection',
        message: 'Choose a password from a service below? (Enter 1-5)',
        require: true,
        
    })
}