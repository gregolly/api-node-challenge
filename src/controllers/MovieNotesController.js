const knex = require("../database/knex")

class MovieNotesController {
    async create(req, res) {
        const { title, description, rating, tags } = req.body
        const { user_id } = req.params

        console.log(user_id)

        const [note_id] = await knex("movie_notes")
        .insert({
                title, 
                description, 
                rating, 
                user_id 
            })

        const tagsInsert = tags.map(name => {
            return {
                note_id,
                user_id,
                name
            }
        })

        await knex("movie_tags").insert(tagsInsert)

        return res.json()
    }

    async get (req, res) {
        const { id } = req.params

        const movieNote = await knex("movie_notes").where({ id }).first()
        const tags = await knex("movie_tags").where({ note_id: id }).orderBy("name")

        return res.json({
            ...movieNote,
            tags
        })
    }

    async delete(req, res) {
        const { id } = req.params

        await knex("movie_notes").where({ id }).delete()

        return res.json()
    }

    async index(req, res) {
        const { title, user_id, tags } = req.query

        let movieNotes

        if(tags && tags.length) {
            const filterTags = tags.split(',').map(tags => tags.trim())

            movieNotes = await knex("movie_tags")
            .select([
                "movie_notes.id",
                "movie_notes.title",
                "movie_notes.user_id",
            ])
            .where("movie_notes.user_id", user_id)
            .whereLikes("movie_notes.title", `%${title}%`)
            .whereIn("name", filterTags)
            .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
            .orderBy("movie_notes.title")
        } else {
            movieNotes = await knex("movie_notes")
            .where({ user_id })
            .whereLike("title", `%${title}%`)
            .orderBy("title")
        }

        const userTags = await knex("movie_tags").where({ user_id })
        const notesWithTags = movieNotes.map(notes => {
            const noteTags = userTags.filter(tag => tag.note_id === notes.id)

            return {
                ...movieNotes,
                tags: noteTags
            }
        })

        return res.json(notesWithTags)
    }
}

module.exports = MovieNotesController