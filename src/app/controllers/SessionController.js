import jwt from 'jsonwebtoken'
import * as Yup from 'yup'

import User from '../models/User'
import Auth from '../../config/auth'

class SessionController {
    async store(req, res) {

        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required()
        })

        /* Verificando se o req.body esta passando conforme o schema. */
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({ error: 'Validation fails' });
        }


        const { email, password } = req.body

        /* Verificao de usuario existente. */
        const user = await User.findOne({ where: { email }})
        if(!user) {
            res.status(401).json({ error: "User not found" })
        }

        /* Verificacao se a senha passada é a mesma que ja se encontra cadastrada. */
        if(!await user.checkPassword(password)) {
            res.status(401).json({ error: "Password does not match" })
        }

        const { id, name } = user

        return res.json({
            user: {
                id,
                name,
                email,
            },
            /*
                Payload -> Informacoes adicionais que sao incorporadas dentro do token.
                Segundo campo trata-se de um texto de seguranca.
                Terceiro campo trata-se de informacoes do token
            */
            token: jwt.sign({ id }, Auth.secret, {
                expiresIn: Auth.expiresInd
            })
        })
    }
}

export default new SessionController()
