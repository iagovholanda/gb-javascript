export default {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, /* Se vai ou não utilizar SSL. */
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    /* Configurações Padrão */
    default: {
        from: 'Equipe GoBarber <noreply@gobarber.com>'
    }
}
