import net from "net";
import { PORT } from "../app";

const client = new net.Socket();
client.connect(PORT, () => {
    console.log("Connected");
    client.write("Yo Serverrrrrrrr");
});

client.on('data', (data) => {
    console.log(data.toString('utf-8'));
    client.destroy();
});

client.on('close', () => console.log("Closed"));
