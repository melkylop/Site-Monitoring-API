# Site-Monitoring-API
Uma API REST completa para monitoramento de sites em tempo real, desenvolvida para acompanhar a disponibilidade e performance de portais governamentais.

🛠️ Tecnologias Utilizadas
Backend: Node.js + Express.js

Banco de Dados: SQLite

HTTP Client: Axios

Agendamento: Cron jobs

CORS: Habilitado para integrações

📋 Funcionalidades Principais
🔍 Monitoramento Automático
Verificação periódica de sites (configurável: 1, 5, 10, 15, 30, 60 minutos)

Coleta de métricas de performance (tempo de resposta, status HTTP)

Detecção automática de downtime

📊 Métricas Coletadas
Status Code HTTP (200, 404, 500, etc.)

Response Time (tempo de resposta em milissegundos)

Disponibilidade (uptime/downtime)

Headers de resposta

Conteúdo parcial da página

🌐 API REST Endpoints
Gestão de Sites
http
GET    /api/sites                 # Listar todos os sites
POST   /api/sites                 # Adicionar novo site
GET    /api/sites/:id             # Buscar site por ID
PUT    /api/sites/:id             # Atualizar site
DELETE /api/sites/:id             # Remover site
Monitoramento e Dados
http
GET    /api/sites/:id/checks      # Histórico de verificações
POST   /api/sites/:id/check       # Forçar verificação manual
GET    /health                    # Status da API
Relatórios e Analytics
http
GET    /api/reports/dashboard                 # Dashboard geral
GET    /api/reports/sites/:id/availability    # Disponibilidade por site
GET    /api/reports/sites/:id/errors          # Relatório de erros
GET    /api/reports/sites/:id/performance     # Performance histórica

🔔 Integrações Webhook
Notificações em tempo real para cada verificação

Suporte a múltiplos webhooks por site

Formato JSON padronizado para integração

🗃️ Estrutura do Banco de Dados
Tabela: sites
sql
id, url, check_time, webhook_url, created_at, active
Tabela: site_checks
sql
id, site_id, check_timestamp, response_time, status_code, 
success, error_message, response_headers, response_body

🚀 Como Utilizar
1. Adicionar Site para Monitoramento
bash
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://exemplo.gov.br",
    "check_time": 5,
    "webhook_url": "https://webhook.site/seu-codigo"
  }'
2. Verificar Sites Monitorados
bash
curl http://localhost:3000/api/sites
3. Acessar Dashboard
bash
curl http://localhost:3000/api/reports/dashboard

⚙️ Configuração e Deploy
Variáveis de Ambiente
env
PORT=3000
NODE_ENV=production
Instalação e Execução
bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Produção
npm start

📈 Casos de Uso
👨‍💼 Para Governos e Prefeituras
Monitoramento de portais públicos 24/7

Alertas de indisponibilidade em tempo real

Métricas de performance para otimização

🏢 Para Empresas
Monitoramento de sites críticos

SLA e relatórios de disponibilidade

Integração com sistemas de alerta

👨‍🔧 Para Desenvolvedores
API REST para integrações

Webhooks para automações

Dados históricos para análise

🔧 Arquitetura
text
Client → API REST → Monitor → Sites Externos
                ↓
           Banco de Dados ← Webhooks
📄 Licença
MIT License - livre para uso e modificação.

👥 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

📞 Suporte
Para dúvidas ou sugestões, abra uma issue no repositório.

🎯 Status do Projeto: ✅ Produção - Monitorando 10 sites governamentais em tempo real
