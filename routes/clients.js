import express from 'express'
import pool from '../db.js'


const clientsRouter = express.Router()

clientsRouter.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM clients')
    res.json(result.rows)
})

clientsRouter.get('/:id', async (req, res) =>{
    const result = await pool.query('SELECT * FROM clients WHERE id = ($1)', [req.params.id])
    res.json(result.rows[0])
})

clientsRouter.post('/', async (req, res) => {
    const result = await pool.query('INSERT INTO clients (company_name, contact_name, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.body.company_name, req.body.contact_name, req.body.phone, req.body.email, req.body.address])
    res.json(result.rows[0])
})

clientsRouter.patch('/:id', async (req, res) => {
    try {
        const fields = Object.keys(req.body)
        const values = Object.values(req.body)
        const setClauses = fields.map((field, index) => `${field} = $${index + 1}`)
        const setString = setClauses.join(', ')

        const result = await pool.query(`UPDATE clients SET ${setString} WHERE id = $${fields.length + 1} RETURNING *`, [...values, req.params.id])

        res.json(result.rows[0])
    }

    catch (error) {
        res.status(500).json({error : error.message})
    }
})

clientsRouter.delete('/:id', async (req, res) => {
    try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id])

    res.json(result.rows[0])
    }
    catch (error) {
        res.status(500).json({error : error.message})
    }
})


export default clientsRouter