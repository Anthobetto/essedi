import express from "express"
import pool from "../db.js"
import authenticateToken from "../middleware/auth.js"
import { v2 as cloudinary } from 'cloudinary'
import multer from "multer"

const uploadRouter = express.Router()

uploadRouter.use(authenticateToken)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const upload = multer({ storage: multer.memoryStorage() })

uploadRouter.post('/', upload.array('photos', 10), async (req, res) => {
    try {
        const uploadedPhotos = []
        for (const file of req.files) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'task_photos' },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    }
                ).end(file.buffer)
            })
            await pool.query('INSERT INTO task_photos (task_id, user_id, description, url) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.task_id, req.user.id, req.body.description, result.secure_url])
            uploadedPhotos.push(result)
        }
        res.json(uploadedPhotos)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default uploadRouter