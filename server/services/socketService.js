const socketIo = require('socket.io');

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all origins for now, restrict in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a specific order room (for both Driver and Customer)
        socket.on('join_room', (orderId) => {
            socket.join(orderId);
            console.log(`Socket ${socket.id} joined room: ${orderId}`);
        });

        // Driver sends location update
        socket.on('update_location', (data) => {
            const { orderId, location } = data;
            // Broadcast to everyone in the room EXCEPT the sender (Driver)
            // actually, broadcast to everyone including sender is fine, but usually we want to update the map
            // for the customer.
            io.to(orderId).emit('location_updated', location);
            console.log(`Location update for order ${orderId}:`, location);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { init, getIo };
