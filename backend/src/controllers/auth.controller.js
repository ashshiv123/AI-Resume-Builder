const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


async function registerUserController(req, res){
    const {username, email, password} = req.body

    if(!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    const isUserExist = await userModel.findOne({
        or: [
            {username: username},
            {email: email}
        ]
    })

    if(isUserExist) {
        return res.status(400).json({
            message: "User already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const newUser = await userModel.create({
        username: username,
        email: email,
        password: hash 
    })
}

module.exports = {
    registerUserController
}