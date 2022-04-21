import { Sequelize, Model } from 'sequelize'

class Appointment extends Model {
    static init(sequelize) {
        /* super -> Chamando a classe pai. */
        super.init({
            date: Sequelize.DATE,
            canceled_at: Sequelize.DATE
        },
        {
            /* Configuracoes */
            sequelize
        })

        /* Desta forma eu sempre vou retornar o model que foi inicializado. */
        return this
    }
        static associate(models) {
            this.belongsTo(models.User, { foreignKey: 'user_id',  as: 'user'})
            this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider'})
        }
}

export default Appointment
