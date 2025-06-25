const { Reservation, User } = require('../models');

exports.createReservation = async (req, res) => {
    try {
        const { name, contact_info, reservation_date, guest_count } = req.body;
        
        const userId = req.user ? req.user.id : null;
        let finalName = name;
        let finalContact = contact_info;

        if (userId) {
            const user = await User.findByPk(userId);
            if (user) {
                finalName = user.name;
                finalContact = user.email;
            }
        }
        
        if (!finalName || !finalContact || !reservation_date || !guest_count) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const newReservation = await Reservation.create({
            name: finalName,
            contact_info: finalContact,
            reservation_date,
            guest_count,
            userId: userId
        });

        res.status(201).json({ message: 'Solicitud de reserva enviada exitosamente.', reservation: newReservation });
    } catch (error) {
        console.error("Error en createReservation:", error);
        res.status(400).json({ message: 'Error al crear la solicitud de reserva.', error: error.message });
    }
};