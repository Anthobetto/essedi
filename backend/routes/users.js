import express from 'express'
import pool from '../db.js'
import bcrypt from 'bcrypt'
import authenticateToken from '../middleware/auth.js'
import requireRole from '../middleware/requireRole.js'


const usersRouter = express.Router()


usersRouter.use(authenticateToken)


usersRouter.get('/', requireRole('admin', 'superadmin'), async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone, role FROM users')
        res.json(result.rows)
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

usersRouter.get('/me', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phone FROM users WHERE id = ($1)', [req.user.id])
        res.json(result.rows[0])
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

usersRouter.get('/:id', requireRole('admin', 'superadmin'), async (req, res) => {
    try{
        const result = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = ($1)', [req.params.id])
        res.json(result.rows[0])
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})


usersRouter.post('/', requireRole('admin', 'superadmin'), async (req, res) => {
    try {
        const plainPassword = req.body.password
        const hashedPassword = await bcrypt.hash(plainPassword, 10)
        const result = await pool.query('INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.body.name, req.body.email, hashedPassword, req.body.role, req.body.phone])
        const { password, ...userWithOutPassword } = result.rows[0]
        res.json(userWithOutPassword)
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

usersRouter.patch('/:id', requireRole('admin', 'superadmin'), async(req, res) => {
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

usersRouter.delete('/:id', requireRole('admin', 'superadmin'), async(req, res) => {
     try {
        const result = await pool.query('DELETE FROM users WHERE id = ($1) RETURNING *', [req.params.id])
        res.json(result.rows)
    }
    catch(error) {
        res.status(500).json({error: error.message})
    }
})

export default usersRouter