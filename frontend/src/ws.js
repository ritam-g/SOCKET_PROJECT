import {io} from "socket.io-client";

export function connectWS() {
    return io('http://localhost:3000');
}
export function connectWSRender() {
    return io('https://socket-project-4pa7.onrender.com');
}