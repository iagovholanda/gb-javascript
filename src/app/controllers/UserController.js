import * as Yup from 'yup';
import User from '../models/User'

class UserController {
    async store(req, res) {

        /*
            Object - Yup valida um objeto ja que o req.body é um objeto.
            Shape - Formato que o deseja que o objeto tenha.
        */

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6)
        })

        /* Verificando se o req.body esta passando conforme o schema. */
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({ error: 'Validation fails' });
        }

        /*  Validation email */
        const userExists = await User.findOne({ where: { email: req.body.email }})

        if(userExists) {
            return res.status(400).json({ error: 'User already exists'})
        }

        const { id, name, email, provider } = await User.create(req.body)

        return res.json({
            id,
            name,
            email,
            provider
        })
    }

    async update(req, res) {

        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6),

            /*
                O campo password, so vai ser obrigado se caso o campo oldPassword for informado.
                Portanto se o campo oldPassword for informado, o campo password passa a ser obrigatorio.
                Caso contrario o mesmo passa a não ser obrigatorio.
            */

            password: Yup.string().min(6).when('oldPassword', (oldPassword, field) =>
                oldPassword ? field.required() : field
            ),

            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            )
        })

        /* Verificando se o req.body esta passando conforme o schema. */
        if(!(await schema.isValid(req.body))){
            return res.status(400).json({ error: 'Validation failed' });
        }


        const { email, oldPassword } = req.body

        const user = await User.findByPk(req.userId)

        /*
            Verifica-se primeiro se o email passado pelo usuario é diferente do email do usuario retornado anterior.
            Se for diferente, verifica-se se o existe o usuário para dar continuidade ao processo. O processo de alteracao
            so sera realizado se for repassado um novo email diferente do que ja foi cadasatrado.
        */

        if(email && email !== user.email) {
            const userExists = await User.findOne({ where: { email }})

            if(userExists) {
                return res.status(400).json({ error: 'User already exists'})
            }
        }

        /*
            Aqui iremos verificar se o oldPassword confere com password ja cadastrado pelo usuário.
            Essa verificacao so vai se encaminha, caso o mesmo passe o campo oldPassword, o que
            significa dizer, que o mesmo deseja atualizar sua senha.
        */

        if(oldPassword && !(await user.checkPassword(oldPassword))) {
            return res.status(401).json({ error: 'Password does not match' })
        }

        const { id, name, provider } = await user.update(req.body)
        return res.json({
            user: {
                id,
                name,
                email,
                provider
            }
        })


        console.log(req.userId)
    }
}

export default new UserController();
