const { hash, compare } = require('bcryptjs')
const sqliteConnection = require("../database/sqlite")
const AppError = require('../utils/AppError')
const UserRepository = require('../repositories/UserRepository')

class UsersController {
    async create(req, res) {
        const { name, email, password } = req.body
        
        const userRepository = new UserRepository()

        const checkUsersExists = await userRepository.findByEmail(email)

        if(checkUsersExists) {
            throw new AppError("E-mail ja esta em uso!")
        }

        const hashedPassword = await hash(password, 8)
        
        userRepository.create({ name, email, password: hashedPassword })

        return res.status(200).json()
    }

    async get(req, res) {
        const database = await sqliteConnection()
        const users = await database.all("SELECT * FROM users")

        return res.json(users)
    }

    async update(req, res) {
        const { name, email, password, old_password } = req.body
        const user_id = req.user.id

        const database = await sqliteConnection()
        const user = await database?.get("SELECT * FROM users WHERE id = (?)", [user_id])
        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(!user) {
            throw new AppError('Usuario nao existe')
        }

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError('Este email ja esta em uso')
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if(password && !old_password) {
            throw new AppError('Voce precisa informar a senha antiga para definir a nova senha')
        }

        if(password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)

            if(!checkOldPassword) {
                throw new AppError('A senha antiga nao confere!')
            }

            user.password = await hash(password, 8)
        }

        await database.run(`
            UPDATE users SET 
            name = ?, 
            email = ?,
            password = ?,
            updated_at = DATETIME('NOW')
            WHERE id = ?`,
            [user.name, user.email, user.password, user_id]
        )

        return res.json()
    }
}

module.exports = UsersController