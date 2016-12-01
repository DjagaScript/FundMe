'use strict';

let express = require('express');

let app = express();
let stage = process.env.NODE_ENV  || 'development';
let config = require('./server/config/config')[stage];
let database = require('./server/config/database')(config);
let data = require('./server/data')();
let multer = require('multer');
let storage = multer.memoryStorage();

let upload = multer({ storage: storage });

let options = {
    app,
    data,
    database,
    upload
};

require('./server/config/express')(config, app);
require('./server/routers')(options);

app.listen(config.port, () => console.log('Server running at port : ' + config.port));


