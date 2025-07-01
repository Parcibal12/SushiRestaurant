const { Product, Category } = require('../models');

exports.getAllProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = parseInt(req.query.offset, 10) || 0;
        let categoryName = req.query.category; 

        console.log(`[Backend Debug] Petición recibida: limit=${limit}, offset=${offset}, category=${categoryName}`);

        let whereClause = {};
        let includeClause = {
            model: Category,
            attributes: ['name']
        };

        if (categoryName) {
            console.log(`[Backend Debug] Filtrando por categoría: ${categoryName}`);
            const categorySearchName = categoryName.toLowerCase();
            console.log(`[Backend Debug] Nombre de categoría a buscar en DB (toLowerCase): ${categorySearchName}`);

            const categoryObj = await Category.findOne({ 
                where: { 
                    name: categorySearchName
                } 
            });

            console.log(`[Backend Debug] Resultado de Category.findOne:`, categoryObj ? categoryObj.toJSON() : 'Categoría no encontrada');

            if (categoryObj) {
                whereClause.category_id = categoryObj.id;
                console.log(`[Backend Debug] category_id encontrado para filtro: ${categoryObj.id}`);
            } else {
                console.log(`[Backend Debug] No se encontró la categoría "${categoryName}" en la base de datos.`);
                return res.json({ products: [], total: 0, hasMore: false });
            }
        }

        const options = {
            where: whereClause,
            include: includeClause,
            order: [['id', 'ASC']],
            limit: limit,   
            offset: offset, 
        };

        console.log(`[Backend Debug]:`, JSON.stringify(options));

        const { count, rows: products } = await Product.findAndCountAll(options);

        console.log(`[Backend Debug] Productos encontrados: ${products.length}, Total: ${count}, HasMore: ${(offset + products.length) < count}`);

        const hasMore = (offset + products.length) < count;

        res.json({ products, total: count, hasMore }); 

    } catch (error) {
        console.error("Error ", error);
        res.status(500).json({ message: 'Error al obtener los productos.', error: error.message });
    }
};