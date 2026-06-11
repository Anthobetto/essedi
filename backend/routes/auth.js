import express from 'express'
import pool from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const authRouter = express.Router()

authRouter.post('/register', async (req, res) => {
    try {
        const plainPassword = req.body.password
        const hashedPassword = await bcrypt.hash(plainPassword, 10)
        const result = await pool.query('INSERT INTO users (name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.body.name, req.body.email, hashedPassword, req.body.phone, req.body.address])
        const { password, ...userWithOutPassword } = result.rows[0]

        res.json(userWithOutPassword)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const plainPassword = req.body.password
        const result = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [req.body.email])
        const user = result.rows[0]
        const match = await bcrypt.compare(plainPassword, user.password)

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign({id: user.id, email: user.email}, process.env_JWT, {expiresIn: '8h'})

        res.json({token})


    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default authRouter