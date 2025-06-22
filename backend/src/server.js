const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db.js');
const { sequelize, User, Category, Product } = require('./models');

require('./models/user'); 

const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productRoutes.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando correctamente.');
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa');

        await sequelize.sync({ alter: true });
        console.log("Modelos fueron sincronizados exitosamente.");

        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();