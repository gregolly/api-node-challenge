require("dotenv/config")
require('express-async-errors')
const express = require('express')
const migrationsRun = require('./database/sqlite/migrations')
const AppError = require('./utils/AppError')
const routes = require('./routes')
const uploadConfig = require("./configs/upload")
const cors = require('cors')

const app = express()

migrationsRun()

app.use(express.json())
app.use(cors())
app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER))
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

const PORT = process.env.PORT || 3334

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))