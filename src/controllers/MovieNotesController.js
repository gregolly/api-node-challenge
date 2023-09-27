const knex = require("../database/knex")

class MovieNotesController {
    async create(req, res) {
        const { title, description, rating, tags } = req.body
        const user_id = req.user.id

        if (rating < 0 || rating > 5) {
            throw new AppError("A nota deve ser entre 0 e 5.");
        }

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

    async show(request, response) {
        const { id } = request.params;

        const note = await knex("movie_notes").where({ id }).first();
        const tags = await knex("movie_tags").where({ note_id: id }).orderBy("name");

        return response.json({
            ...note,
            tags
        });
    }

    async delete(req, res) {
        const { id } = req.params

        await knex("movie_notes").where({ id }).delete()

        return res.json()
    }

    async index(req, res) {
        const { title, tags } = req.query
        const user_id = req.user.id

        let movieNotes

        if(tags) {
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
                ...notes,
                tags: noteTags
            }
        })

        return res.json(notesWithTags)
    }
}

module.exports = MovieNotesController