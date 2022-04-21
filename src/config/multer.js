import multer from 'multer'
import crypto from 'crypto'
import { extname, resolve } from 'path'

/*
    extname -> Retorna o formato/extensão do arquivo enviado.
    resolve -> Patch.resolve percorre os caminhos das pastas do usuário.
*/

export default {
    storage: multer.diskStorage({
        destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
        filename: (req, file, cb) => { /* Formatação e nome do arquivo / imagem. */
            crypto.randomBytes(16, (err, res) => {
                if(err) return cb(err)

                return cb(null, res.toString('hex') + extname(file.originalname))
            })
        },
    })
}
