import { format, parseISO} from 'date-fns'
import { pt } from 'date-fns/locale/pt'
import Mail from '../../lib/Mail'

class CancellationMail {
    get key() {
        return 'CancellationMail';
        /* Cada job, precisa de uma chave unica. */
    }

    /* Tarefa que vai executar, quando esse processo for executado. */
    async handle({ data }) {
        const { appointment } = data

        await Mail.sendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>`,
            subject: 'Agendamento cancelado',
            template: 'cancellation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format(
                    parseISO(appointment.date),
                    "'dia' dd 'de' MMMM' , às' H:mm'h",
                    { locale: pt}
                )
            }
        })
    }
}


export default new CancellationMail()


/*
    Em caso de importacao do arquivo CancellationMail, ele tera acesso a propiedade key
    por meio do CancellationMail.key().
*/
