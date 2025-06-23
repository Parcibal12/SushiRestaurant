const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const blogRoutes = require('./routes/blogRoutes.js');
const reservationRoutes = require('./routes/reservationRoutes.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/reservations', reservationRoutes);



async function startServer() {
    try {
        await sequelize.sync({ alter: true });
        console.log("Todos los modelos fueron sincronizados exitosamente con la base de datos.");

        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo sincronizar la base de datos:', error);
    }
}

startServer();