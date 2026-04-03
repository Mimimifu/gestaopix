const { PeerServer } = require('peer');

const port = process.env.PORT || 9000;

const peerServer = PeerServer({
    port: port,
    path: '/myapp',
    proxied: true // Importante para rodar atrás de proxies como o do GitHub/Render/Heroku
});

console.log(`Servidor PeerJS rodando na porta: ${port}`);

peerServer.on('connection', (client) => {
    console.log(`Novo cliente conectado: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
    console.log(`Cliente desconectado: ${client.getId()}`);
});
