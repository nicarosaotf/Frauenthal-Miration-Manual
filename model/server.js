require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bp = require('body-parser');

class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.ticketsPath = '/tickets';
        this.eventsPath = '/events';
        this.etixPath = '/etix';
        this.contactsPath = '/contacts';

        this.middlewares();

        this.routes();
    };

    middlewares(){    
        this.app.use(cors());
        this.app.use(bp.json());
        this.app.use(express.json());
        this.app.use(express.static('views'));
    };

    routes(){
        this.app.use(this.etixPath, require('../routes/etix'));
        this.app.use(this.ticketsPath, require('../routes/tickets'));
        this.app.use(this.eventsPath, require('../routes/events'));
        this.app.use(this.contactsPath, require('../routes/contacts'));
    };

    listen(){
        this.app.listen(this.port, () => {
            console.log('Server running on port', this.port);
        });
    };
};

module.exports = Server;