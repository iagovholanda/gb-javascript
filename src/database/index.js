import Sequelize from 'sequelize';
import mongoose from 'mongoose';

/* Importando os Models */
import User from '../app/models/User'
import File from '../app/models/File'
import Appointment from '../app/models/Appointment'

import dbConfig from '../config/database'

const models = [User, File, Appointment]

class Database {
    constructor() {
        this.init()
        this.mongo()
    }

    init() {
        this.connection = new Sequelize(dbConfig)
        models
        .map(model => model.init(this.connection))
        .map(model => model.associate && model.associate(this.connection.models))
    }

    mongo() {
        this.mongoConnection = mongoose.connect(
            process.env.MONGO_URL,
            { useNewUrlParser: true }
        )
    }
}

export default new Database()
