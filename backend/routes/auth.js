import express from 'express'
import pool from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const authRouter = express.Router()

authRouter.post('/login', async (req, res) => {
    try {
        const plainPassword = req.body.password
        const result = await pool.query('SELECT id, email, password, role FROM users WHERE email = $1', [req.body.email])
        const user = result.rows[0]
        const match = await bcrypt.compare(plainPassword, user.password)

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign({id: user.id, email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: '8h'})
        res.json({token})

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default authRouter