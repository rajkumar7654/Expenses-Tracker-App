require('dotenv').config();

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const app = express();

const port = process.env.PORT || 3000;

// importing routes

const path = require('path');
const cors = require('cors');

const loginRoute = require('./routes/loginRoute');
const signUpRoute = require('./routes/signUpRoute');
const forgetPasswordRoute = require('./routes/forgetPasswordRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const paymentRoute = require('./routes/paymentRoute');
const premiumDashboardRoute = require('./routes/premiumDashboardRoute');

// database

const sequelize = require('./utils/db-connection');
const User = require('./models/signUpModel');
const Expense = require('./models/dashboardModel');

// Middleware

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Import associations

require("./associations/associations.js");

// SignUp routes

app.use('/user', signUpRoute);
app.use('/dashboard', dashboardRoute);
app.use('/premium-dashboard', premiumDashboardRoute);
app.use('/payment', paymentRoute);
app.use('/user', loginRoute);
app.use('/forgetpassword', forgetPasswordRoute);


// Database Connection
const isDevelopment = process.env.NODE_ENV !== 'production';
sequelize.sync({ alter: isDevelopment }).then(async () => {

    // Update existing users' totalExpenses on startup
    try {

        const users = await User.findAll({
            where: {
                totalExpenses: 0
            }
        });

        for (const user of users) {

            const expenses = await Expense.findAll({
                where: {
                    UserId: user.id
                },

                attributes: [
                    [
                        sequelize.fn('SUM', sequelize.col('amount')),
                        'total'
                    ]
                ]
            });

            const total = expenses[0]?.dataValues.total || 0;

            if (total > 0) {

                await user.update({
                    totalExpenses: total
                });

                console.log(
                    `Updated ${user.name}'s totalExpenses to ₹${total}`
                );
            }
        }

    } catch (error) {

        console.error(
            'Error updating totalExpenses on startup:',
            error
        );
    }


    // Start Server - HTTP for production (Render provides HTTPS), HTTPS for local
    if (process.env.NODE_ENV === 'production') {
        // Production: Use HTTP (Render provides HTTPS termination)
        http.createServer(app).listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } else {
        // Local Development: Use HTTPS with SSL certs
        try {
            const sslOptions = {
                key: fs.readFileSync(
                    process.env.SSL_KEY_PATH || path.join(__dirname, 'cert', 'server.key')
                ),
                cert: fs.readFileSync(
                    process.env.SSL_CERT_PATH || path.join(__dirname, 'cert', 'server.crt')
                )
            };
            https.createServer(sslOptions, app).listen(port, () => {
                console.log(`HTTPS Server running at https://localhost:${port}`);
            });
        } catch (error) {
            console.warn('SSL certificates not found, falling back to HTTP');
            http.createServer(app).listen(port, () => {
                console.log(`HTTP Server running at http://localhost:${port}`);
            });
        }
    }

}).catch((error) => {

    console.error(
        'Unable to connect to the database:',
        error
    );

});