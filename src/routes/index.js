const { Router } = require('express')

const usersRouter = require('./users.routes')
const movieNotesRouter = require('./movie_notes.routes')
const movieTagsRouter = require('./movie_tags.routes')
const sessionsRouter = require('./sessions.routes')

const routes = Router()

routes.use("/users", usersRouter)
routes.use("/movieNotes", movieNotesRouter)
routes.use("/movieTags", movieTagsRouter)
routes.use("/sessions", sessionsRouter)

module.exports = routes