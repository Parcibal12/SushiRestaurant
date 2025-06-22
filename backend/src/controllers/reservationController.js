const { Reservation } = require('../models');

exports.createReservation = async (req, res) => {
    try {
        const { name, contact_info, reservation_date, guest_count } = req.body;

        if (!name || !contact_info || !reservation_date || !guest_count) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const newReservation = await Reservation.create({
            name,
            contact_info,
            reservation_date,
            guest_count
        });

        res.status(201).json({ message: 'Solicitud de reserva enviada exitosamente.', reservation: newReservation });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear la solicitud..', error: error.message });
    }
};