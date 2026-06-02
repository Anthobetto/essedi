import express from 'express'
import pool from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const authRouter = express.Router()


authRouter.post('/register', async (req, res) => {
    try {
        const plainPassword = req.body.password
        const hashedPassword = await bcrypt.hash(plainPassword, 10)
        const result = await pool.query('INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.email, hashedPassword, req.body.phone])
        const user = result.rows[0]
        const { password, ...userWithoutPassword } = user

        res.json(userWithoutPassword)

    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const result = await pool.query('SELECT email, password, id FROM users WHERE email = $1', [req.body.email])
        const user = result.rows[0]
        const password = req.body.password
        const match = await bcrypt.compare(password, user.password)

        if (!match) {
            return res.status(401).json({ error: 'Invalid password' })
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' })

        res.json({ token })
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default authRouter