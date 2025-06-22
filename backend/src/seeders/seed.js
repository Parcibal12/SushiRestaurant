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
        console.log('Conexión establecida, iniciando seeder...');


        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados. Las tablas están listas.');

        const categoryPromises = Object.values(categoryMap).map(name => 
            Category.findOrCreate({ where: { name: name } })
        );
        await Promise.all(categoryPromises);
        console.log('Categorías creadas o ya existentes.');

        const categories = await Category.findAll();
        const categoriesByName = categories.reduce((acc, cat) => {
            acc[cat.name] = cat.id;
            return acc;
        }, {});

        const productPromises = menuData.map(product => {
            const categoryName = categoryMap[product.category];
            const category_id = categoriesByName[categoryName];

            return Product.findOrCreate({
                where: { name: product.name },
                defaults: {
                    description: product.description,
                    price: parseFloat(product.price.replace('$', '')),
                    image_url: product.image,
                    category_id: category_id
                }
            });
        });
        await Promise.all(productPromises);
        console.log('Productos creados o ya existentes.');

        console.log('Seeding completado exitosamente');

    } catch (error) {
        console.error('Error durante el seeding:', error);
    } finally {
        await sequelize.close();
    }
};

seedDatabase();