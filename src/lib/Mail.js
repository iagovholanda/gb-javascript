import nodemailer from 'nodemailer';
/* Indicar o repositorio dos templates, para percorrer as pastas */
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    /* Desestruturação, pegando apenas algumas informações
    passadas dentro o arquivo de configuração mailConfig. */

    const { host, port, secure, auth } = mailConfig;

    /* Nodemailer - Conexão com serviço externo para envio de email */
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      /* Verifica se dentro do auth existe um usuário, caso não
      existe ele retorna o valor nulo. Existem algumas estrategias de
      envio de email, que não existe autenticação. */
      auth: auth.user ? auth : null,
    });

    this.configureTemplates();
  }

  /* Configuração Templates Enginer */
  configureTemplates() {
    /* View do caminhos dos emails */
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    /* compile -> Como que ele compila os nossos templates de emails */
    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: exphbs.create({
          /* Pega mesmo caminho passado no viewPath, chamando em seguida
          a pasta layouts. */
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  /* Metodo responsavel por enviar o email */
  sendMail(message) {
    /* sendMail -> Metodo do nodemailer para enviar email */
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
