import Appointment from '../models/Appointment'
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import pt from 'date-fns/locale/pt'
import * as Yup from 'yup'

import User from '../models/User'
import File from '../models/File'
import Notification from '../schemas/Notification'

import Mail from '../../lib/Mail'

class AppointmentController {
    async index(req, res) {
        const { page = 1 } = req.query

        const appointments = await Appointment.findAll({
            where: { user_id: req.userId, canceled_at: null}, /* Retorna os dados o usuario que esta logado, com agendamentos nao cancelados. */
            order: [
                'date' /* Ordenando os agendamentos por data. */
            ],
            attributes: ['id', 'date'], /* Apenas os dados que foram retornados. */
            limit: 20,
            offset: (page - 1) * 20, /* Pular a quantidade de registro de acordo com a conta retornada. */
            include: [ /* Incluindo informacoes dos relacionamentos. */
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id','path','url']
                        }
                    ]
                }
        ]
    })

        return res.json(appointments)
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            date: Yup.date().required(),
            provider_id: Yup.number().required()
        })

        if(!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails'})
        }

        const { provider_id, date } = req.body

        /* Buscando se o usuario é ou não um provider. */
        const checkProvider = await User.findOne({ where: { id: provider_id, provider: true }})
        if(!checkProvider) {
            return res.status(401).json({ error: 'You can only create appointments with providers' })
        }
        /*
            parseISO -> Transforma a string em um objeto date do javascript, que pode ser usado no startOfHour por exemplo.
            No startOfHour, ele sempre vai considerar apenas o inicio da hora, e não os minutos e segundos.
        */

        const hourStart = startOfHour(parseISO(date))

        /*
            Verificando se a data que foi passada, escolhida pelo usuário, esta antes da atual data utilizada, se sim um error é retornado.
            O que significa que a data que o usuario informou ja passou.
        */
        if(isBefore(hourStart, new Date())) {
            return res.status(400).json({ error: 'Past dates are not permitted' })
        }


        /*
            Verifica se o usuario nao possui um agendamento marcado para aquele determinado horario.
            Nao permitindo criar dois agendamentos em uma mesma data.
        */
        const checkAvailability = await Appointment.findOne({
             where: {
                provider_id,
                canceled_at: null, /* Se o canceled_at nao estiver nulo, é porque a data esta disponivel. */
                date: hourStart /* Garante pegar apenas as horas fechadas. */
             },
        })

        if(checkAvailability) {
            return res.status(400).json({ error: 'Appointment date is not available'})
        }


        /*
            Verificacao se o usuario que estou buscando é provider e o mesmo usuario logado.
            Em caso de confirmacao, retorna-se um erro.
        */

        const checkUserLogged = await User.findOne({
            where: { id: req.userId, provider: true },
        })

        if(checkUserLogged) {
            return res.status(401).json({ error: 'Logged in user cannot schedule services for himself.'})
        }

        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            date: hourStart /* Evitar que os angendamentos seja em horas quebradas.*/
        })


        /*
            Notificar o prestador de serviço, quando o mesmo receber um novo agendamento.
        */

        const user = await User.findByPk(req.userId) /* Buscando as informacoes do usuario que esta logado*/
        const formattedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM' , às' H:mm'h",
            { locale: pt}
        )

        await Notification.create({
            content: `Novo agendamento realizado para ${user.name} para o ${formattedDate}`,
            user: provider_id

        })



        return res.json(appointment)
    }

    async delete(req, res) {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['name', 'email']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                }
            ]
        })

        if(appointment.user_id !== req.userId) {
            return res.status(401).json({
                error: "You don't have permission to cancel this appointment."
            })
        }

        /*
            subHours -> Reduz o numero de horas de uma determinada data.
            O campo appointment.date ja vem em formato de data, sem a necessidade de utilzacao do parseISO, que é quando o valor em string.
        */

        const dateSub = subHours(appointment.date, 2)

        /* Se o dateSub for menor, antes da data atual entao é permitido que ele cancele o angendamento. */
        if(isBefore(dateSub, new Date())) {
            return res.status(401).json({
                error: 'You can only cancel appointment 2 hours in advance.'
            })
        }

        appointment.canceled_at = new Date() /* O campo canceled_at, vai receber a data atual que foi o dia da realizacao do cancelamento caso ele seja confirmado. */
        await appointment.save()

        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancellation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format(
                    appointment.date,
                    "'dia' dd 'de' MMMM' , às' H:mm'h",
                    { locale: pt}
                )
            }
        })

        return res.json(appointment)

    }
}

export default new AppointmentController()
