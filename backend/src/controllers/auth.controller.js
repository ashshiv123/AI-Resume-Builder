const userModel = require('../models/user.model')
const tokenBlacklistModel = require('../models/blackList.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


/**
 * Register a new user
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body. It checks if the user already exists, hashes the password and creates a new user in the database.
 * @access Public
 */
async function registerUserController(req, res){
    const {username, email, password} = req.body

    if(!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    const isUserExist = await userModel.findOne({
        $or: [
            { username },
            { email }
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

    const token = jwt.sign(
        { id: newUser._id, username: newUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )

    res.cookie('token', token)

    res.status(201).json({
        message : "User registered successfully",
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    })
}


/**
 * @name loginUserController
 * @description Login a user, expects email and password in the request body. It checks if the user exists, compares the password and returns a JWT token if successful.
 * @access Public
 */
async function loginUserController(req, res){
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )

    res.cookie('token', token)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description Logout a user, clears the token from the user's cookies and adds the token to the blacklist.
 * @access Public  
 */
async function logoutUserController(req, res){
    const token = req.cookies.token

    if (!token) {
        return res.status(400).json({
            message: "No token found"
        })
    }   

    // Add the token to the blacklist
    await tokenBlacklistModel.create({ token })

    // Clear the token from the user's cookies
    res.clearCookie('token')

    res.status(200).json({
        message: "User logged out successfully"
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController
}