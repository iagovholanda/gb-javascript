import { startOfDay, endOfDay, setHours, setMinutes, setSeconds, format, isAfter } from 'date-fns'
import Appointment from '../models/Appointment'
import { Op } from 'sequelize'

class AvailableController {
    async index(req, res) {
        const { date } = req.query;

        if(!date) {
            return res.status(400).json({ error: 'Invalid date'})
        }

        const searchDate = Number(date)

        /*
            Listar todos os agendamentos presente na data passada.
        */

        const appointment = await Appointment.finddAll({
            where: {
                provider_id: req.params.providerId,
                canceled_at: null,
                date: {
                    [Op.between]: [
                        startOfDay(searchDate),
                        endOfDay(searchDate)
                     ]
                }
            }
        })

        /* Todos os horarios disponivel que esse prestador possui. */
        const schedule = [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
            '23:00'
        ]

        const available = schedule.map( time => {
             const [hour, minute] = time.split(':')
             const value = setSeconds(setMinutes(setHours(searchDate, hour), minute), 0)


            return {
                time,
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
                /*
                    Verificando se a data vallue, ja passou da data atual. Verificando se alguns dos horarios
                    nao esta presente dentro dos agendamentos, ou seja, se possui algum agendamento com as horas
                    sendo utilizadas.
                */
                available: isAfter(value, new Date())  && !appointment.find( a => format(a.date, 'HH:mm') === time)
            }

        })

        return res.json(available)
    }
}

export default new AvailableController()
