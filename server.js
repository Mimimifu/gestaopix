const express = require('express');

const path = require('path');

const { PeerServer } = require('peer');

const app = express();

const port = process.env.PORT || 9000;

app.use('/', express.static(path.join(__dirname, '')));

app.get('/',(req,res)=>{
    res.sendFile(path.join,(__dirname,'index.html'));
})

const server = app.listen(port, () =>{
    console.log(`Server ON port ${port}`);
})

const peerServer = PeerServer({
    path: '/',
    proxied: true, 
    server: server,
});

console.log(`Servidor PeerJS rodando na porta: ${port}`);

peerServer.on('connection', (client) => {
    console.log(`Novo cliente conectado: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
    console.log(`Cliente desconectado: ${client.getId()}`);
});
