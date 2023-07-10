const { hash } = require('bcryptjs')
const sqliteConnection = require("../database/sqlite")
const AppError = require('../utils/AppError')

class UsersController {
    async create(req, res) {
        const { name, email, password } = req.body

        const database = await sqliteConnection()
        const checkUsersExists =  await database?.get("SELECT * FROM users WHERE email = (?)", [email])

        if(checkUsersExists) {
            throw new AppError("User already exists")
        }

        const hashedPassword = await hash(password, 8)

        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        )

        return res.status(200).json()
    }

    async get(req, res) {
        const database = await sqliteConnection()
        const users = await database.all("SELECT * FROM users")

        return res.json(users)
    }
}

module.exports = UsersController