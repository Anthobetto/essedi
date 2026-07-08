import jwt from 'jsonwebtoken'

const requireRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' })
        }
        next()
    }
}

export default requireRole