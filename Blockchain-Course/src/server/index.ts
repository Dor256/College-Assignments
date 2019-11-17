import net from "net";
import { PORT } from "../app";

const server = net.createServer((socket) => {
    socket.on('data', (data) => console.log(data.toString('utf-8')));
    socket.write('Yo Clientttttt');
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));