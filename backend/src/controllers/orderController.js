const { sequelize, Order, OrderItem } = require('../models');

exports.createOrder = async (req, res) => {
    const { items, totalPrice } = req.body;
    const userId = req.user.id;

    const t = await sequelize.transaction();

    try {
        const order = await Order.create({
            userId: userId,
            total_price: totalPrice,
            status: 'recibido'
        }, { transaction: t });

        const orderItems = items.map(item => ({
            quantity: item.quantity,
            price: item.price,
            OrderId: order.id,
            ProductId: item.productId
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });

        await t.commit();

        res.status(201).json({ message: 'Pedido realizado exitosamente.', orderId: order.id });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error al realizar el pedido.', error: error.message });
    }
};