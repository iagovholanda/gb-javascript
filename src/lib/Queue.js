import Bee from 'bee-queue'
import CancellationMail from '../app/jobs/CancellationMail'
import redisConfig from '../config/redis'

/* Todo novo job criado entra nesse array. */
const jobs = [CancellationMail]

class Queue {
    constructor() {
         this.queues = {}

        this.init()
    }

    init() {
        /*
            Todos os jobs estao sendo armazenado dentro da variavel this.queue. Dentro dela passamos
            a fila que possui a conexao com o banco nao relacional e armazena-se tambem o metodo handle
            que vai processar o nosso jobs. Cada vez que o job for processado, ele recebe esta informacoes
            e vai executar.

            Bee -> Instancia que se conecta com o redis que consegue armazenar e recuperar valores do bd.
            handle -> Responsavel por processar as filas
        */

        jobs.forEach(({ key, handle }) => {
            this.queues[key] = {
                bee: new Bee(key, {
                    redis: redisConfig,
                }),
                handle,
            }
        })
    }

    /*
        Adicionar novos trabalhos dentro de cada fila. Cada vez por exemplo que um email for disparado
        é preciso colocar esse novo job, dentro da fila para que seja realizado o seu processamento.

        queue -> A qual fila eu vou adicionar um novo trabalho
        job -> Receber o dados do job em si.
    */
    add(queue, job) {
        return this.queues[queue].bee.createJob(job).save()
    }

    /*
        Processar os jobs.
    */

    processQueue() {
        jobs.forEach(job => {
            const { bee, handle } = this.queues[job.key]
            bee.on('failed', this.handleFailure).process(handle)
        })
    }

    handleFailure(job, err) {
        console.log('Queue ${job.queue.name}: FAILED', err)
    }

}


export default new Queue()
