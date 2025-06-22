const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, introduce todos los campos.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

         
        const newUser = await User.create({
            name: name,
            email: email,
            password_hash: hashedPassword
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor introduce email y contraseña.' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        const payload = {
            user: {
                id: user.id,
                name: user.name
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {

        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};