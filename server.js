// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentBid = 0;
let currentBidder = null;

// Middleware para servir archivos estáticos (como el cliente de la subasta)
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado:", socket.id);

  // Enviar la oferta actual cuando un nuevo cliente se conecta
  socket.emit("currentBid", { currentBid, currentBidder });

  // Manejar las ofertas entrantes
  socket.on("newBid", (data) => {
    if (data.bid > currentBid) {
      currentBid = data.bid;
      currentBidder = data.bidder;

      // Emitir la nueva oferta a todos los clientes conectados
      io.emit("currentBid", { currentBid, currentBidder });
    } else {
      socket.emit(
        "bidRejected",
        "La oferta debe ser mayor que la oferta actual"
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
