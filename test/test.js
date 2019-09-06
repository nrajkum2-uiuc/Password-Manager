require('dotenv').config()
const _ = require('lodash')
var expect = require('chai').expect
const util = require('../util')

describe('util testing', function() {

    const passwordInfos = [
        {
            service: 'gmail.com',
            username: 'whoitis@gmail.com',
            password: 'heyhey1!2_@@'
        },
        {
            service: 'github.com',
            username: 'nithub',
            password: 'lLc00lJ11!'
        }
    ]

    it('encrypt a password and decrypt it', function(done) {
        const originalPassword =passwordInfos[0].password 
        const encrypPassword = util.encryptPassWord(originalPassword)
        const decrypPassword = util.decryptPassword(encrypPassword)
        expect(decrypPassword).to.equal(originalPassword)
        done()
    })

    it('save a password to file', function(done) {
        const passwordInfo = _.defaults({ password: util.encryptPassWord(passwordInfos[0].password) }, passwordInfos[0])
        util.savePasswordInfoToFile(passwordInfo.password, passwordInfo.username, passwordInfo.service)
        done()
    })
})