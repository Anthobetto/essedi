import pkg from 'pg'
const { Pool } = pkg
const pool = new Pool ({
    database: 'essedi'
})


export default pool