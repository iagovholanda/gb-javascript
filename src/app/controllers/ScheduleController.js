import User from '../models/User'
import Appointment from '../models/Appointment'
import { startOfDay, endOfDay, parseISO } from 'date-fns'
import { Op } from 'sequelize'

/*
    Listar os agendamentos do prestador de servicos .
*/

class ScheduleController {
    async index(req, res) {
        const checkUserProvider = await User.findOne({
            where: { id: req.userId, provider: true } /* Se o usuario logado nao for provider, um error é retornado. */
        })

        if(!checkUserProvider) {
            return res.status(401).json({ error: 'User is not a provider'})
        }

        const { date } = req.query
        const parsedDate = parseISO(date)

        /*
            Listagem de agendamentos realizados em uma data especifica, levando em consideracao
            o inicio do dia e o final do dia.
        */

        const listAppointments = await Appointment.findAll({
            where: {
                provide_id: req.userId,/* Listar todos os agendamentos que o prestador é o mesmo usuario logado */
                canceled_at: null,
                date: {
                    /* Retorna o valor como chave do objeto. */
                    [Op.between]: [
                       startOfDay(parsedDate),
                       endOfDay(parsedDate)
                    ]
                    /* Retorna todos os agendamentos do comeco do dia ate o final do dia da data em que foi passada como parametro. */
                }
            },
            order: ['date']
        })

        return res.json(listAppointments)
    }


}



export default new ScheduleController()
