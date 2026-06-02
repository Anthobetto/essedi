import express from 'express'
import clientsRouter from './routes/clients.js';
import projectsRouter from './routes/projects.js'
import tasksRouter from './routes/tasks.js'
import usersRouter from './routes/users.js';
import servicesRouter from './routes/services.js';
import authRouter from './routes/auth.js';
import dotenv from 'dotenv';
dotenv.config()

const port = 4821;
const app = express();


app.use(express.json())


app.use('/clients', clientsRouter)
app.use('/projects', projectsRouter)
app.use('/tasks', tasksRouter)
app.use('/users', usersRouter)
app.use('/services', servicesRouter)
app.use('/auth', authRouter)

app.listen(port, () => {
    console.log(`Server listening http://localhost:${port}`)
});