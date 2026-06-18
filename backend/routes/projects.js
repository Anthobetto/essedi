import express from 'express'
import pool from '../db.js'
import authenticateToken from '../middleware/auth.js'

const projectsRouter = express.Router()


projectsRouter.use(authenticateToken);


projectsRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT projects.*, clients.company_name FROM projects LEFT JOIN clients ON projects.client_id = clients.id')
        res.json(result.rows)
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

projectsRouter.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects WHERE id = ($1)', [req.params.id])
        res.json(result.rows[0])
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

projectsRouter.post('/', async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO projects (name, client_id, status, start_date, end_date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.body.name, req.body.client_id, req.body.status, req.body.start_date, req.body.end_date, req.body.notes])
        res.json(result.rows[0])
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

projectsRouter.patch('/:id', async (req, res) => {
    try {
        const fields = Object.keys(req.body)
        const values = Object.values(req.body)
        const setClauses = fields.map((field, index) => `${field} = $${index + 1}`)
        const setString = setClauses.join(', ')

        const result = await pool.query(`UPDATE projects SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`, [...values, req.params.id])

        res.json(result.rows[0])
    }

    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

projectsRouter.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id])

        res.json(result.rows[0])
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})


export default projectsRouter