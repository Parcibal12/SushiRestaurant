const { BlogPost, User, Like, sequelize } = require('../models');

const DEFAULT_POST_IMAGES = [
    '/assets/blog/blog1.png',
    '/assets/blog/blog2.png',
    '/assets/blog/blog3.png',
    '/assets/blog/blog4.png',
    '/assets/blog/blog5.png'
];
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            attributes: {
                include: [[sequelize.fn("COUNT", sequelize.col("Likes.id")), "likeCount"]]
            },
            include: [
                { model: User, as: 'author', attributes: ['name'] },
                { model: Like, attributes: [] }
            ],
            group: ['BlogPost.id', 'author.id'],
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las publicaciones.', error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id, {
            include: { model: User, as: 'author', attributes: ['name', 'email'] }
        });
        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la publicación.', error: error.message });
    }
};

exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const authorId = req.user.id;

    try {
        const existingPost = await BlogPost.findOne({ where: { title } });
        if (existingPost) {
            return res.status(400).json({ message: 'Ya existe una publicación con ese título.' });
        }


        const randomIndex = Math.floor(Math.random() * DEFAULT_POST_IMAGES.length);
        
        const randomImageUrl = DEFAULT_POST_IMAGES[randomIndex];

        const newPost = await BlogPost.create({
            title,
            content,
            authorId,
            imageUrl: randomImageUrl
        });
        
        res.status(201).json(newPost);

    } catch (error) {
        console.error("ERROR EN BACKEND (createPost):", error);
        res.status(400).json({ message: 'Error al crear la publicación.', error: error.message });
    }
};




exports.updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await BlogPost.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para editar esta publicación.' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();
        
        res.json(post);

    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar la publicación.', error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await BlogPost.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta publicación.' });
        }

        await post.destroy();
        
        res.json({ message: 'Publicación eliminada exitosamente.' });

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la publicación.', error: error.message });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            where: { authorId: req.user.id },
            attributes: {
                include: [[sequelize.fn("COUNT", sequelize.col("Likes.id")), "likeCount"]]
            },
            include: [
                { model: User, as: 'author', attributes: ['name'] },
                { model: Like, attributes: [] }
            ],
            group: ['BlogPost.id', 'author.id'],
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tus publicaciones.', error: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const blogPostId = req.params.id;
        const userId = req.user.id;
        let liked = false;

        const existingLike = await Like.findOne({ where: { blogPostId, userId } });

        if (existingLike) {
            await existingLike.destroy({ transaction: t });
            liked = false;
        } else {
            await Like.create({ blogPostId, userId }, { transaction: t });
            liked = true;
        }

        const newLikeCount = await Like.count({ where: { blogPostId }, transaction: t });
        
        await t.commit();
        
        res.status(200).json({ liked, newLikeCount });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error al procesar el like.', error: error.message });
    }
};

exports.getMyFavoritePosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const likedPosts = await BlogPost.findAll({
            attributes: {
                include: [[sequelize.fn("COUNT", sequelize.col("Likes.id")), "likeCount"]]
            },
            include: [
                { model: User, as: 'author', attributes: ['name'] },
                {
                    model: Like,
                    where: { userId },
                    attributes: [],
                    required: true
                }
            ],
            group: ['BlogPost.id', 'author.id'],
            order: [['createdAt', 'DESC']]
        });
        res.json(likedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tus favoritos.', error: error.message });
    }
};