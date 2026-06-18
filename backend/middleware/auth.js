import jwt from 'jsonwebtoken'

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Invalid token' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) res.status(403).json({ error: 'Invalid credentials' })
        req.user = user
        next()
    })
}

export default authenticateToken