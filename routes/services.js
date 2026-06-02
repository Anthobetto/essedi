import express from 'express'
import pool from '../db.js'
import authenticateToken from '../middleware/auth.js'

const servicesRouter = express.Router()


servicesRouter.use(authenticateToken)


servicesRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services')
        res.json(result.rows)
    }
    catch(error){
        res.status(500).json({error : error.message})
    }
})

servicesRouter.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services WHERE id = ($1)', [req.params.id])
        res.json(result.rows[0])
    }
    catch(error){
        res.status(500).json({error : error.message})
    }
})

servicesRouter.post('/', async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO services (name, code, price, vat) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.code, req.body.price, req.body.vat])
        res.json(result.rows[0])
    }
    catch(error){
        res.status(500).json({error : error.message})
    }
})

servicesRouter.patch('/:id', async (req, res) => {
    try {
        const fields = Object.keys(req.body)
        const values = Object.values(req.body)
        const setClauses = fields.map((field, index) => `${field} = $${index + 1}`)
        const setString = setClauses.join(', ')

        const result = await pool.query(`UPDATE services SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`, [...values, req.params.id])
        res.json(result.rows[0])
    }
    catch(error){
        res.status(500).json({error : error.message})
    }
})

servicesRouter.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM services WHERE id = ($1) RETURNING *', [req.params.id])
        res.json(result.rows[0])
    }
    catch(error){
        res.status(500).json({error : error.message})
    }
})

export default servicesRouter