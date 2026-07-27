import express from "express"
import pool from "../db.js"
import authenticateToken from "../middleware/auth.js"

const taskHourRouter = express.Router()

taskHourRouter.use(authenticateToken)

taskHourRouter.get('/:task_id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM task_hours WHERE task_id = $1', [req.params.task_id])
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: error.message })

    }
})

taskHourRouter.post('/', async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO task_hours (task_id, user_id, start_time, end_time, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.body.task_id, req.body.user_id, req.body.start_time, req.body.end_time, req.body.notes])
        res.json(result.rows[0])
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log('HOURS ERROR:', error.message)
    }
})
export default taskHourRouter