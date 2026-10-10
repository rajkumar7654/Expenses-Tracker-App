const { Sequelize } = require('sequelize');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
};

// Add SSL only for non-localhost databases (cloud databases)
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    dbConfig.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    };
}

const sequelize = new Sequelize(
    process.env.DB_NAME || 'expensesapp',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '1234',
    dbConfig
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        console.log('Database Config:', {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'expensesapp',
            user: process.env.DB_USER || 'root'
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;