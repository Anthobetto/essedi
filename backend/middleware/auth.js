import jwt from 'jsonwebtoken';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token not provided' });
    }

    try {
        const decodedUser = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
                if (error) return reject(error); 
                resolve(user); 
            });
        });

        req.user = decodedUser;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export default authenticateToken;