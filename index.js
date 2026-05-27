import express from 'express'
import pool from './db.js';
import clientsRouter from './routes/clients.js';


const port = 4821;
const app = express();


app.use(express.json())


app.use('/clients', clientsRouter)


app.listen(port, () => {
    console.log(`Server listening http://localhost:${port}`)
});