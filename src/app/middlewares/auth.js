import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import authConfig from '../../config/auth'

export default async(req, res, next) => {
    const authHeader = req.headers.authorization

    if(!authHeader) {
        return res.status(401).error({ message: 'Token not provided'})
    }

    /* Separacao da autenticacao JWT */
    const [, token] = authHeader.split(' ')

    try {
        const decoded = await promisify(jwt.verify)(token, authConfig.secret)

        req.userId = decoded.id /* userId, recebe o id do usuario logado. */

        return next()
    } catch (error) {
        return res.status(401).json({ message: 'Token Invalid'})
    }

}
