require('express-async-errors')
const express = require('express')
const migrationsRun = require('./database/sqlite/migrations')
const AppError = require('./utils/AppError')
const routes = require('./routes')

const app = express()

migrationsRun()

app.use(express.json())

app.use(routes)


app.use((error, request, res, next) => {
    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message
        })
    }

    console.error(error)

    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    })
})

const PORT = 3334

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))