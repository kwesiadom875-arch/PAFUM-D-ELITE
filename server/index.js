const http = require('http');
const app = require('./app');
const socketService = require('./services/socketService');
require('./tasks/automationTask');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
