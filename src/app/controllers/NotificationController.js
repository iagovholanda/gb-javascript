import User from "../models/User";
import Notification from "../schemas/Notification";

class NotificationController {
    async index(req, res) {

        /*
            Esta seguimento, sera destinado apenas ao usuario que for provider, caso contrario, nao tera acesso
            a esta rota. Esta rota tem como proposito, retorna todas as notificacoes de agendamento de um usuario
            provider logado.
        */

        const checkUserProvider = await User.findOne({
            where: { id: req.userId, provider: true },
        })

        if(!checkUserProvider) {
            return res.status(401).json({ error: 'User is not a provider'})
        }

        const notifications = await Notification.find({
            user: req.userId
        })
        .sort({ createdAt: 'desc'}) /* Ordenando pela data de criacao em ordem decrescente */
        .limit(20)

        /*
            limit -> Limite a quantidade de notificacoes a serem retornadas para o usuario.
            sort('createdAt) -> O metodo sort, vai ordenar os agendamento por data de criacao por meio do createdAt
        */


        return res.json(notifications)
    }

    async update(req, res) {

        /*
            findByIdAndUpdate -> Vai buscar o registro e a atualiza-lo.
            findByIdAndDelete -> Vai buscar o resgistro e deletar o mesmo.
        */

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true } /* o new vai retornar a mesmo notificacao para o usuario so que agora com o seu status ataulizado, mostrado como lida. Caso nao seja utilizado o status da mensagem atualiza, mas sua forma nao. */
        )

        return res.json(notification)
    }


}



export default new NotificationController()
