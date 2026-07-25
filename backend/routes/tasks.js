import express from 'express'
import pool from '../db.js'
import authenticateToken from '../middleware/auth.js'

const tasksRouter = express.Router()


tasksRouter.use(authenticateToken)


tasksRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT tasks.*, projects.name AS project_name, clients.company_name   FROM tasks  LEFT JOIN projects ON tasks.project_id = projects.id LEFT JOIN clients ON projects.client_id = clients.id')
        res.json(result.rows)
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

tasksRouter.post('/', async (req, res) => {
    try {
        const result = await pool.query(
            'INSERT INTO tasks (name, status, project_id) VALUES ($1, $2, $3) RETURNING *',
            [req.body.name, req.body.status, req.body.project_id]
        )
        const task = result.rows[0]

        if (req.body.user_id && req.body.user_id.length > 0) {
            for (const userId of req.body.user_id) {
                await pool.query(
                    'INSERT INTO task_user (task_id, user_id) VALUES ($1, $2)',
                    [task.id, userId]
                )
            }
        }

        res.json(task)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

tasksRouter.patch('/:id', async (req, res) => {
    try {
        const fields = Object.keys(req.body)
        const values = Object.values(req.body)
        const setClauses = fields.map((field, index) => `${field} = $${index + 1}`)
        const setString = setClauses.join(', ')

        const result = await pool.query(`UPDATE tasks SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`, [...values, req.params.id])
        res.json(result.rows[0])
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

tasksRouter.delete('/:id', async (req, res) => {
    try {
        const task = await pool.query('SELECT status FROM tasks WHERE id = $1', [req.params.id])
        if (task.rows[0].status !== 'pending') {
            return res.status(400).json({ error: 'Only pending tasks can be deleted' })
        }
        await pool.query('DELETE FROM task_user WHERE task_id = $1', [req.params.id])
        const result = await pool.query('DELETE FROM tasks WHERE id = ($1) RETURNING *', [req.params.id])
        res.json(result.rows[0])
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default tasksRouter 