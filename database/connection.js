const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

class Database
{
    constructor()
    {
        this.connect();
    }

    connect()
    {
        mongoose.connect('mongodb+srv://caio:Cavalcante12345.@cluster0.ojgnhhi.mongodb.net/twitterClone?retryWrites=true&w=majority',
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