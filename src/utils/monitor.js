const axios = require("axios");
const cron = require("cron");
const Site = require("../models/Site");
const SiteCheck = require("../models/SiteCheck");

class SiteMonitor {
  constructor() {
    this.jobs = new Map();
  }

  // Fazer check individual em um site
  async checkSite(site) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Verificando: ${site.url}`);

      const response = await axios.get(site.url, {
        timeout: 30000, // 30 segundos
        validateStatus: null, // Aceitar todos os status codes
      });

      const responseTime = Date.now() - startTime;

      const checkData = {
        site_id: site.id,
        response_time: responseTime,
        status_code: response.status,
        error_message: null,
        response_headers: JSON.stringify(response.headers),
        response_body: response.data ? response.data.substring(0, 1000) : null,
        success: response.status < 400,
      };

      // Salvar no banco
      await SiteCheck.create(checkData);

      // Enviar para webhook se configurado
      if (site.webhook_url) {
        await this.sendToWebhook(site, checkData);
      }

      console.log(`✅ ${site.url} - ${response.status} (${responseTime}ms)`);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const checkData = {
        site_id: site.id,
        response_time: responseTime,
        status_code: null,
        error_message: error.message,
        response_headers: null,
        response_body: null,
        success: false,
      };

      await SiteCheck.create(checkData);

      if (site.webhook_url) {
        await this.sendToWebhook(site, checkData);
      }

      console.log(`❌ ${site.url} - ERRO: ${error.message}`);
    }
  }

  // Enviar dados para webhook
  async sendToWebhook(site, checkData) {
    try {
      const webhookData = {
        site_id: site.id,
        url: site.url,
        check_timestamp: new Date().toISOString(),
        response_time: checkData.response_time,
        status_code: checkData.status_code,
        success: checkData.success,
        error_message: checkData.error_message,
        metadata: {
          body_size: checkData.response_body
            ? checkData.response_body.length
            : 0,
        },
      };

      await axios.post(site.webhook_url, webhookData, {
        timeout: 10000,
      });

      console.log(`📤 Webhook enviado para: ${site.webhook_url}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar webhook: ${error.message}`);
    }
  }

  // Agendar check para um site
  scheduleSite(site) {
    // Remover job existente se houver
    if (this.jobs.has(site.id)) {
      this.jobs.get(site.id).stop();
    }

    // Criar cron job baseado no check_time
    const cronPattern = `*/${site.check_time} * * * *`; // A cada X minutos

    const job = new cron.CronJob(cronPattern, () => {
      this.checkSite(site);
    });

    job.start();
    this.jobs.set(site.id, job);

    console.log(`⏰ Agendado: ${site.url} a cada ${site.check_time} minutos`);
  }

  // Inicializar monitoramento de todos os sites
  async initialize() {
    try {
      const sites = await Site.findAll();

      for (const site of sites) {
        this.scheduleSite(site);
      }

      console.log(`🎯 ${sites.length} sites agendados para monitoramento`);
    } catch (error) {
      console.error("❌ Erro ao inicializar monitoramento:", error.message);
    }
  }

  // Adicionar novo site ao monitoramento
  async addSite(siteId) {
    const site = await Site.findById(siteId);
    if (site) {
      this.scheduleSite(site);
    }
  }

  // Remover site do monitoramento
  removeSite(siteId) {
    if (this.jobs.has(siteId)) {
      this.jobs.get(siteId).stop();
      this.jobs.delete(siteId);
      console.log(`🗑️ Monitoramento removido para site ID: ${siteId}`);
    }
  }
}

// Instância global do monitor
const siteMonitor = new SiteMonitor();

// Função para iniciar o monitoramento
async function startMonitoring() {
  await siteMonitor.initialize();
}

module.exports = { siteMonitor, startMonitoring };
