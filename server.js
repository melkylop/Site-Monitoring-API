// server.js - VERSÃO CORRIGIDA E FUNCIONANDO
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
require('dotenv').config();  // 👈🔥 ADICIONE ESTA LINHA AQUI

const app = express();
const PORT = process.env.PORT || 3000;  // 👈🔥 MODIFIQUE ESTA LINHA

// Middleware de autenticação Bearer Token
const authMiddleware = (req, res, next) => {
    // Não requer auth para health check e raiz
    if (req.path === '/health' || req.path === '/') {
        return next();
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Token de acesso necessário',
            message: 'Use: Authorization: Bearer SEU_TOKEN'
        });
    }
    
    const token = authHeader.substring(7); // Remove "Bearer "
    
    if (token !== process.env.API_TOKEN) {
        return res.status(403).json({ 
            error: 'Token inválido',
            message: 'Token de acesso incorreto'
        });
    }
    
    next();
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', authMiddleware); 

// Configurar banco de dados
const db = new sqlite3.Database("./database.db");

// Promisify para usar async/await
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Criar tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      check_time INTEGER,
      webhook_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      check_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      response_time REAL,
      status_code INTEGER,
      success BOOLEAN
    )
  `);

  console.log("✅ Banco de dados preparado!");
});

// ✅✅✅ FUNÇÃO PARA ENVIAR WEBHOOK (CORRIGIDA) ✅✅✅
async function sendWebhookEvent(eventType, data) {
  if (!data.webhook_url) {
    console.log("❌ Nenhum webhook_url configurado");
    return;
  }

  try {
    const eventData = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.log(`📤 Tentando enviar webhook para: ${data.webhook_url}`);
    const response = await axios.post(data.webhook_url, eventData, {
      timeout: 5000,
    });

    console.log(
      `✅ Webhook ${eventType} enviado com sucesso! Status: ${response.status}`
    );
  } catch (error) {
    console.log(`❌ Erro ao enviar webhook: ${error.message}`);
  }
}

// ✅✅✅ FUNÇÃO checkSite (CORRIGIDA) ✅✅✅
async function checkSite(site, sendWebhook = true) {
  const startTime = Date.now();

  try {
    console.log(`🔍 Verificando: ${site.url}`);

    const response = await axios.get(site.url, {
      timeout: 10000,
    });

    const responseTime = Date.now() - startTime;
    const success = response.status < 400;

    // Salvar no banco
    await db.runAsync(
      "INSERT INTO site_checks (site_id, response_time, status_code, success) VALUES (?, ?, ?, ?)",
      [site.id, responseTime, response.status, success]
    );

    // ✅✅✅ ENVIAR WEBHOOK (CORRIGIDO)
    if (site.webhook_url && sendWebhook) {
      await sendWebhookEvent("site_check", {
        site_id: site.id,
        url: site.url,
        webhook_url: site.webhook_url, // ✅ ADICIONADO
        check_timestamp: new Date().toISOString(),
        response_time: responseTime,
        status_code: response.status,
        success: success,
        message: success ? "Site online" : "Site com problemas",
        check_interval: "2min",
      });
    }

    console.log(
      `✅ ${site.url} - ${response.status} (${responseTime}ms) ${
        sendWebhook && site.webhook_url ? "📤" : "💾"
      }`
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(
      `❌ ${site.url} - ERRO: ${error.message} ${
        sendWebhook && site.webhook_url ? "📤" : "💾"
      }`
    );

    // Salvar erro no banco
    await db.runAsync(
      "INSERT INTO site_checks (site_id, response_time, status_code, success) VALUES (?, ?, ?, ?)",
      [site.id, responseTime, null, false]
    );

    // ✅✅✅ ENVIAR WEBHOOK DE ERRO (CORRIGIDO)
    if (site.webhook_url && sendWebhook) {
      await sendWebhookEvent("site_check", {
        site_id: site.id,
        url: site.url,
        webhook_url: site.webhook_url, // ✅ ADICIONADO
        check_timestamp: new Date().toISOString(),
        response_time: responseTime,
        status_code: null,
        success: false,
        error_message: error.message,
        message: "Site offline ou com erro",
        check_interval: "2min",
      });
    }
  }
}

// ✅✅✅ MONITORAMENTO (CORRIGIDO) ✅✅✅
function startMonitoring() {
  console.log("🔄 Iniciando monitoramento...");

  let checkCounter = 0;

  // Verificar sites a cada 1 minuto
  setInterval(async () => {
    try {
      const sites = await db.allAsync("SELECT * FROM sites");

      checkCounter++;
      const shouldSendWebhook = checkCounter % 2 === 0; // A cada 2 minutos

      console.log(
        `⏰ Verificação #${checkCounter} - Webhook: ${
          shouldSendWebhook ? "SIM" : "NÃO"
        } - Sites: ${sites.length}`
      );

      // Verificar todos os sites
      for (const site of sites) {
        await checkSite(site, shouldSendWebhook);
      }
    } catch (error) {
      console.error("❌ Erro no monitoramento:", error.message);
    }
  }, 60000); // A cada 1 minuto
}

// ROTAS DA API

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Sistema funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Health check para Kubernetes (/healthz)
app.get("/healthz", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "site-monitoring-api",
    uptime: process.uptime()
  });
});

// Listar todos os sites
app.get("/api/sites", async (req, res) => {
  try {
    const sites = await db.allAsync("SELECT * FROM sites");
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅✅✅ CRIAR SITE (CORRIGIDO) ✅✅✅
app.post("/api/sites", async (req, res) => {
  const { url, check_time, webhook_url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  try {
    const result = await db.runAsync(
      "INSERT INTO sites (url, check_time, webhook_url) VALUES (?, ?, ?)",
      [url, check_time || 5, webhook_url]
    );

    const newSite = {
      id: result.lastID,
      url: url,
      check_time: check_time || 5,
      webhook_url: webhook_url,
      created_at: new Date().toISOString(),
    };

    // ✅✅✅ WEBHOOK DE CADASTRO (CORRIGIDO)
    if (webhook_url) {
      await sendWebhookEvent("site_registered", newSite);
    }

    res.json({
      id: result.lastID,
      message: "Site adicionado com sucesso!",
    });

    // ✅✅✅ VERIFICAÇÃO IMEDIATA (CORRIGIDO)
    const site = await db.getAsync("SELECT * FROM sites WHERE id = ?", [
      result.lastID,
    ]);
    if (site) {
      console.log("🚀 Verificação imediata após cadastro...");
      await checkSite(site, true); // true = SEMPRE enviar webhook no cadastro
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar site
app.delete("/api/sites/:id", async (req, res) => {
  try {
    await db.runAsync("DELETE FROM sites WHERE id = ?", [req.params.id]);
    res.json({ message: "Site removido com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver histórico de checks
app.get("/api/sites/:id/checks", async (req, res) => {
  try {
    const checks = await db.allAsync(
      "SELECT * FROM site_checks WHERE site_id = ? ORDER BY check_timestamp DESC LIMIT 50",
      [req.params.id]
    );
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅✅✅ ROTA PARA FORÇAR VERIFICAÇÃO (NOVA) ✅✅✅
app.post("/api/sites/:id/check", async (req, res) => {
  try {
    const site = await db.getAsync("SELECT * FROM sites WHERE id = ?", [
      req.params.id,
    ]);
    if (!site) {
      return res.status(404).json({ error: "Site não encontrado" });
    }

    console.log("🔧 Verificação forçada via API...");
    await checkSite(site, true); // true = sempre enviar webhook

    res.json({ message: "Verificação realizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota principal
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Sistema de Monitoramento de Sites",
    endpoints: {
      health: "/health",
      list_sites: "/api/sites (GET)",
      add_site: "/api/sites (POST)",
      delete_site: "/api/sites/:id (DELETE)",
      site_checks: "/api/sites/:id/checks (GET)",
      force_check: "/api/sites/:id/check (POST)",
    },
  });
});

// Iniciar servidor
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
  console.log(`🎉 SERVIDOR RODANDO EM http://${HOST}:${PORT}`);
  console.log(`📍 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`📍 API: http://${HOST}:${PORT}/api/sites`);
  console.log(`📍 Webhook Test: http://${HOST}:${PORT}/api/sites/1/check`);

  startMonitoring();
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Recebido ${signal}. Encerrando servidor graciosamente...`);
  
  server.close(() => {
    console.log('✅ Servidor HTTP fechado.');
    
    // Fechar conexão com banco de dados
    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco de dados:', err);
        process.exit(1);
      }
      console.log('✅ Conexão com banco de dados fechada.');
      process.exit(0);
    });
  });

  // Timeout forçado após 10 segundos
  setTimeout(() => {
    console.error('❌ Forçando encerramento após timeout...');
    process.exit(1);
  }, 10000);
};

// Listeners para os sinais de desligamento
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manipular rejeições de promises não tratadas
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});