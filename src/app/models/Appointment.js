import { Sequelize, Model } from 'sequelize'
import { isBefore, subHours } from 'date-fns'
class Appointment extends Model {
    static init(sequelize) {
        /* super -> Chamando a classe pai. */
        super.init({
            date: Sequelize.DATE,
            canceled_at: Sequelize.DATE,
            /* Se o agendamento ja passou ou não de acordo com a data atual. */
            past: {
                type: Sequelize.VIRTUAL,
                get() {
                    return isBefore(this.date, new Date())
                }
            },
            /*
                Passando a verificacao se é possivel ou não cancelar o agendamento, ja que foi criado uma regra de negocio
                em que o agendamento so pode ser cancelado ate 2 horas antes do seu horario.
            */
            cancelable: {
                type: Sequelize.VIRTUAL,
                get() {
                    return isBefore( new Date(), subHours(this.date, 2))
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
        static associate(models) {
            this.belongsTo(models.User, { foreignKey: 'user_id',  as: 'user'})
            this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider'})
        }
}

export default Appointment
