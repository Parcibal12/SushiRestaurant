const { Product, Category } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: {
                model: Category,
                attributes: ['name']
            },
            order: [['id', 'ASC']]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos.', error: error.message });
    }
};