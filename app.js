var dbConfig = require('./db/knexfile'),
    mailerConfig = require('./config/mailer');

var allowCrossDomain = require('./filters/allow_cross_domain');

var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    knex = require('knex')(dbConfig.development),
    bookshelf = require('bookshelf')(knex),
    bookshelfModel = require('bookshelf-model')
    expressRouteController = require('express-route-controller2'),
    expressMailer = require('express-mailer'),
    jade = require('jade'),
    fs = require('fs');

var app = express();

expressMailer.extend(app, mailerConfig.development);

app.use(morgan('dev'));
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ 'extended': false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Models
app.locals.models = bookshelfModel(bookshelf, __dirname + '/models');

// Controllers
expressRouteController(app, {
    controllers: __dirname + '/controllers',
    routes: require('./config/routes.json')
});

var server = app.listen(3000, function() {
  console.log('Express started at port %d', server.address().port);
});
