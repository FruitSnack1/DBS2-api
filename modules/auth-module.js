const jwt = require('jsonwebtoken')

authenticateToken = (req, res, next) => {
    const token = req.cookies['accessToken'];
    if (token == null) return res.redirect('/')
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.redirect('/')
        req.user = user
        next()
    })
}

generateAccessToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET)
}

authenticateAdmin = (req, res, next) => {
    const token = req.cookies['accessToken'];
    if (token == null) return res.redirect('/')
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.redirect('/')
        if (!req.user.admin) return res.redirect('/')
        next()
    })
}

module.exports = {
    authenticateToken,
    generateAccessToken,
    authenticateAdmin
};