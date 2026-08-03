import express from 'express'
import pool from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import resend from '../resend.js'


const authRouter = express.Router()

authRouter.post('/login', async (req, res) => {
    try {
        const plainPassword = req.body.password
        const result = await pool.query('SELECT id, email, password, role, active FROM users WHERE email = $1', [req.body.email])
        const user = result.rows[0]
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        if (!user.active) {
            return res.status(403).json({ error: 'Access Forbidden' })
        }

        const match = await bcrypt.compare(plainPassword, user.password)
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' })
        res.json({ token })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    const result = await pool.query('SELECT email, id FROM users WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
        return res.status(200).json({ message: `If the email exist, you'll recive an email` })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const date = new Date(Date.now() + 3600000)
    await pool.query('UPDATE users SET reset_token =$1, reset_token_expires =$2 WHERE id = $3', [token, date, user.id])

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Reset your password',
        html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    })
    res.status(200).json({ message: `If the email exist, you'll recive an email` })
})

authRouter.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body
    const result = await pool.query('SELECT email, id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()', [token])
    const user = result.rows[0]

    if (!user) {
        return res.status(401).json({ message: `User not found` })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashedPassword, user.id])
    res.status(200).json({ message: `Password succesfully update` })

})

export default authRouter