const { sequelize, Category, Product } = require('../models');
const { menuData } = require('../../../frontend/blocks/menu/menu-data.js');

const categoryMap = {
    maki: 'Maki',
    uramaki: 'UraMaki',
    'special-rolls': 'Special Rolls'
};

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida');

        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados Las tablas están listas');


        console.log('Limpiando tablas de productos y categorías');
        await Product.destroy({ where: {}, truncate: true, cascade: true });
        await Category.destroy({ where: {}, truncate: true, cascade: true });
        console.log('Tablas limpiadas.');

        const categoryPromises = Object.values(categoryMap).map(name => 
            Category.create({ name: name })
        );
        await Promise.all(categoryPromises);
        console.log('Categorías creadas.');

        const categories = await Category.findAll();
        const categoriesByName = categories.reduce((acc, cat) => {
            acc[cat.name] = cat.id;
            return acc;
        }, {});

        console.log('[Seeder Debug] Categorías cargadas por nombre:', categoriesByName);
        console.log('[Seeder Debug] Número total de productos en menuData:', menuData.length);

        const productPromises = menuData.map(product => {
            const categoryNameForProduct = product.category;
            const category_id = categoriesByName[categoryNameForProduct];

            if (!category_id) {
                console.warn(`[Seeder Debug] Categoría no encontrada para el producto "${product.name}" (${categoryNameForProduct}). Este producto será omitido.`); // Log más detallado
                return null;
            }

            console.log(`[Seeder Debug] Creando producto: ${product.name} con category_id: ${category_id}`);

            return Product.create({
                name: product.name,
                description: product.description,
                price: parseFloat(product.price.replace('$', '')),
                imageUrl: product.image,
                category_id: category_id
            });
        }).filter(p => p !== null);


        await Promise.all(productPromises);
        console.log('Productos creados exitosamente.');

        const finalProductCount = await Product.count();
        console.log(`[Seeder Debug] Número FINAL de productos en la tabla Products: ${finalProductCount}`);

        console.log('completado');

    } catch (error) {
        console.error('Error durante el seeding:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();