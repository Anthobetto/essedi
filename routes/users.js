import express from 'express'
import pool from '../db.js'
import authenticateToken from '../middleware/auth.js'

const usersRouter = express.Router()


usersRouter.use(authenticateToken)


usersRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone, role FROM users')
        res.json(result.rows)
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

usersRouter.get('/:id', async (req, res) => {
    try{
        const result = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ($1)', [req.params.id])
        res.json(result.rows[0])
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

usersRouter.post('/', async (req, res) => {
    try{
        const result = await pool.query('INSERT INTO users (name, password, email, phone, role) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.password, req.body.email, req.body.phone, req.body.role])
        res.json(result.rows[0])
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

usersRouter.patch('/:id', async(req, res) => {
    try {
        const fields = Object.keys(req.body)
        const values = Object.values(req.body)
        const setClauses = fields.map((field, index) => (`${field} = $${index + 1}`))
        const setString = setClauses.join(', ')

        const result = await pool.query(`UPDATE users SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`, [...values, req.params.id])
        res.json(result.rows[0])
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

usersRouter.delete('/:id', async(req, res) => {
     try {
        const result = await pool.query('DELETE FROM users WHERE id = ($1) RETURNING *', [req.params.id])
        res.json(result.rows)
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

export default usersRouter