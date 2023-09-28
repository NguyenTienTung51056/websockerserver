const { log } = require('console');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const socket = new WebSocket.Server({ server });

// Danh sách các client đã kết nối
const clients = new Set();

// Xử lý kết nối từ client
socket.on('connection', (socket, req) => {
    console.log('Client đã kết nối.');
    const ip = req.connection.remoteAddress;
    log(ip);
    // Thêm client vào danh sách các client đã kết nối
    clients.add(socket);

    // // Gửi tin nhắn đến client khi có kết nối thành công
    // socket.send(JSON.stringify({ "message": "Chào mừng đến với WebSocket server!", "clientId": "server" }));

    // Xử lý tin nhắn từ client
    socket.on('message', (message) => {
        try {
            // Kiểm tra tin nhắn có đúng định dạng không
            if (typeof message === 'string') {
                // Xử lý tin nhắn văn bản
                console.log(`Nhận tin nhắn văn bản từ client: ${message}`);
            } else if (message instanceof Buffer) {
                // Xử lý tin nhắn ảnh
                const toString = message.toString();
                // Gửi lại tin nhắn cho tất cả các client khác
                clients.forEach((client) => {
                  //  log(toString);
                    if (client !== socket && client.readyState === WebSocket.OPEN) {
                        client.send(toString);
                    }
                });
            } else {
                console.warn('Tin nhắn không hợp lệ');
            }
        } catch (error) {
            console.error('Lỗi xử lý tin nhắn:', error);
        }
    });

    // Xử lý đóng kết nối
    socket.on('close', () => {
        console.log('Client đã đóng kết nối.');
        // Xóa client khỏi danh sách khi kết nối bị đóng
        clients.delete(socket);
    });

    // Xử lý lỗi
    socket.on('error', (error) => {
        console.error('Lỗi kết nối:', error);
    });
});

app.get('/', (req, res) => {
    res.send('WebSocket Server is running!');
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
