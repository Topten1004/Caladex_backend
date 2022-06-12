const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const stakeRoutes = require('./routes/stakeRoutes');
const stakeLogRoutes = require('./routes/stakeLogRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const cronJob = require('./utils/cronJob');

const app = express();


// Allow Cross-Origin requests
// app.use(cors({
//     origin: ['*'],
//     methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
// }));
app.use(cors());
//app.use(cors({
//    origin: ['https://caladex.org', 'https://www.caladex.org', 'http://caladex.io', 'http://www.caladex.io'],
//    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
//}));

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API 
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({
    limit: '15kb'
}));

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Cron Job
cron.schedule('0 8 * * *', function() {
    // console.log('running a task every minute');
    cronJob.getFinishStakeLog();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/stake', stakeRoutes);
app.use('/api/stakelog', stakeLogRoutes);
app.use('/api/balance', balanceRoutes);

app.use('/api/files', express.static('uploads'));

//handle undefined Routes
app.use('*', (req, res, next) => {
    console.log(req.method);
    const err = new AppError(404, 'fail', 'undefined route');
    next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;