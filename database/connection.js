const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const dotenv = require('dotenv').config();


class Database
{
    constructor()
    {
        this.connect();
    }

    connect()
    {
        mongoose.connect(process.env.DB_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() =>
        {
            console.log('database connection successful');
        })
        .catch((error) => console.log(error));
    }
}

module.exports = new Database();