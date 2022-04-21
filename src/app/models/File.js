import { Sequelize, Model } from 'sequelize'

class File extends Model {
    static init(sequelize) {
        /* super -> Chamando a classe pai. */
        super.init({
            name: Sequelize.STRING,
            path: Sequelize.STRING,
            url: {
                type: Sequelize.VIRTUAL,
                get() {
                    return `http://localhost:3000/files/${this.path}`
                }
            }
        },
        {
            /* Configuracoes */
            sequelize
        })

        /* Desta forma eu sempre vou retornar o model que foi inicializado. */
        return this
    }
}

export default File
