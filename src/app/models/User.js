import { Sequelize, Model } from 'sequelize'
import bcrypt from 'bcryptjs'

class User extends Model {
    static init(sequelize) {
        /* super -> Chamando a classe pai. */
        super.init({

            /*
                Os campos dos models, não precisam ser o reflexos dos campos
                presente na base de dados, ou migrations.

                VIRTUAL -> Campos que jamais vao existir na base de dados.
            */

            name: Sequelize.STRING,
            email: Sequelize.STRING,
            password: Sequelize.VIRTUAL,
            password_hash: Sequelize.STRING,
            provider: Sequelize.BOOLEAN,
        },
        {
            /* Configuracoes */
            sequelize
        })

        /*
            Trecho de codigos, executados de forma automatica.
        */
        this.addHook('beforeSave', async (user) => {
            if(user.password) {
                user.password_hash = await bcrypt.hash(user.password, 8)
            }
        })

        /* Desta forma eu sempre vou retornar o model que foi inicializado. */
        return this
    }


    static associate(models) {
        this.belongsTo(models.File, { foreignKey: 'avatar_id',  as: 'avatar'})
    }


    /* this -> Acesso a todas as informacoes do usuário. */
    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash)
    }
}

export default User
