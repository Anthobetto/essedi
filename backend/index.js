import express from 'express'
import clientsRouter from './routes/clients.js'
import projectsRouter from './routes/projects.js'
import tasksRouter from './routes/tasks.js'
import usersRouter from './routes/users.js'
import servicesRouter from './routes/services.js'
import authRouter from './routes/auth.js'
import assistantRouter from './routes/assistant.js'
import uploadRouter from './routes/taskPhotos.js'
import taskHourRouter from './routes/taskHours.js'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 4821
const app = express()

app.use(cors({ origin: ['http://localhost:3000', 'https://essedi-production-6264.up.railway.app'] }))

app.use(express.json())

app.use('/clients', clientsRouter)
app.use('/projects', projectsRouter)
app.use('/tasks', tasksRouter)
app.use('/users', usersRouter)
app.use('/services', servicesRouter)
app.use('/auth', authRouter)
app.use('/assistant', assistantRouter)
app.use('/taskPhotos', uploadRouter)
app.use('/taskHours', taskHourRouter)

app.listen(port, () => {
    console.log(`Server listening http://localhost:${port}`)
});

