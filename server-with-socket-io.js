// server.js - Versão Local com Socket.IO
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configuração do Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ARMAZENAMENTO EM MEMÓRIA
// ============================================
const salasData = new Map();
const mensagensData = new Map();

// ============================================
// SOCKET.IO EVENTOS
// ============================================
io.on('connection', (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    const sala = socket.handshake.query.sala || 'default';
    const role = socket.handshake.query.role || 'cliente';

    socket.join(sala);
    console.log(`📌 Cliente ${socket.id} entrou na sala "${sala}" como ${role}`);

    // Inicializar dados da sala
    if (!salasData.has(sala)) {
        salasData.set(sala, []);
    }
    if (!mensagensData.has(sala)) {
        mensagensData.set(sala, []);
    }

    // Enviar dados atuais
    const dados = salasData.get(sala) || [];
    socket.emit('db_update', dados);
    console.log(`📤 Enviados ${dados.length} produtos para ${socket.id}`);

    // Enviar mensagens do chat
    const mensagens = mensagensData.get(sala) || [];
    socket.emit('chat_history', mensagens);

    // Cliente solicita dados
    socket.on('request_db', (data) => {
        const salaReq = data.sala || sala;
        const dadosSala = salasData.get(salaReq) || [];
        socket.emit('db_update', dadosSala);
        console.log(`📤 Cliente ${socket.id} solicitou dados da sala "${salaReq}"`);
    });

    // Admin sincroniza dados
    socket.on('sync_db', (data) => {
        const salaSync = data.sala || sala;
        const novosDados = data.data || [];

        if (role === 'admin') {
            salasData.set(salaSync, novosDados);
            // Notificar todos na sala
            io.to(salaSync).emit('db_update', novosDados);
            console.log(`📤 Admin sincronizou ${novosDados.length} produtos na sala "${salaSync}"`);
        } else {
            socket.emit('error', { message: 'Apenas admin pode sincronizar dados' });
        }
    });

    // Chat
    socket.on('chat_message', (data) => {
        const salaChat = data.sala || sala;
        const msg = {
            texto: data.msg || '',
            remetente: role === 'admin' ? 'admin' : 'cliente',
            created_at: new Date().toISOString()
        };

        if (msg.texto.trim()) {
            // Salvar mensagem
            if (!mensagensData.has(salaChat)) {
                mensagensData.set(salaChat, []);
            }
            mensagensData.get(salaChat).push(msg);

            // Enviar para todos na sala
            io.to(salaChat).emit('chat_message', msg);
            console.log(`💬 Mensagem na sala "${salaChat}": ${msg.texto.substring(0, 30)}...`);
        }
    });

    // Desconexão
    socket.on('disconnect', () => {
        console.log(`🔴 Cliente ${socket.id} desconectado da sala "${sala}"`);
    });
});

// ============================================
// ROTAS HTTP
// ============================================
app.get('/status', (req, res) => {
    const salasInfo = [];
    for (const [nome, dados] of salasData) {
        salasInfo.push({
            nome,
            produtos: dados.length,
            mensagens: mensagensData.get(nome)?.length || 0
        });
    }
    res.json({
        status: 'online',
        salas: salasInfo,
        totalSalas: salasData.size,
        timestamp: new Date().toISOString()
    });
});

app.get('/salas', (req, res) => {
    const salasInfo = [];
    for (const [nome, dados] of salasData) {
        salasInfo.push({
            nome,
            produtos: dados.length,
            mensagens: mensagensData.get(nome)?.length || 0
        });
    }
    res.json(salasInfo);
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📡 Socket.IO disponível`);
    console.log(`🌐 Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🌐 Sala: http://localhost:${PORT}/sala.html`);
    console.log(`📊 Status: http://localhost:${PORT}/status`);
});

// Tratamento de erros
process.on('uncaughtException', (err) => {
    console.error('❌ Erro não tratado:', err);
});

process.on('SIGINT', () => {
    console.log('🛑 Servidor finalizado');
    process.exit(0);
});
