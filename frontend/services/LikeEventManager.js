const listeners = [];

export const LikeEventManager = {
    subscribe: (callback) => {
        listeners.push(callback);
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },

    publish: (eventData) => {
        listeners.forEach(callback => {
            try {
                callback(eventData);
            } catch (error) {
                console.error('Error al ejecutar un listener de LikeEventManager:', error);
            }
        });
    }
};