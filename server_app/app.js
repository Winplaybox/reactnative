var mongoUtil = require('./utils/mongo_utils');
mongoUtil.connectToServer(function (err) {
    console.log("db connected");
});

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var commentsRouter = require('./routes/users');
var mediaRouter = require('./routes/media');
var ratingsRouter = require('./routes/users');
var likesRouter = require('./routes/users');
var actsRouter = require('./routes/act');

const dev = process.env.NODE_ENV === 'development';

function protectedRoute(req, res, next) {
    return next();
    if (req.body.token == "bicky_pleeeeez") {
        // authenticated
        return next();
    } else {
        res.send(`Invalid token.`);
    }
}

var app = express();

app.use('/graphql', cors(), graphqlHTTP({
    schema,
    graphiql: dev
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', protectedRoute, cors(), usersRouter);
app.use('/comments', protectedRoute, commentsRouter);
app.use('/media', protectedRoute, cors(), mediaRouter);
app.use('/ratings', protectedRoute, ratingsRouter);
app.use('/likes', protectedRoute, likesRouter);
app.use('/acts', protectedRoute, cors(), actsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

module.exports = app;