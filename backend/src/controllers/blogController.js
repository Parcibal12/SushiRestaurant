const { BlogPost, User } = require('../models');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            include: { model: User, as: 'author', attributes: ['name'] },
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
        const newPost = await BlogPost.create({ title, content, authorId });
        res.status(201).json(newPost);
    } catch (error) {
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
            include: { model: User, as: 'author', attributes: ['name'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tus publicaciones.', error: error.message });
    }
};