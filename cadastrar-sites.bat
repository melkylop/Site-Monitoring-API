@echo off
echo Cadastrando sites no monitoramento...

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://tefe.am.gov.br\", \"check_time\": 5, \"webhook_url\": \"	 https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://agendamento.tefe.am.gov.br", \"check_time\": 5, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://semed.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://mulher.tefe.am.gov.br\", \"check_time\": 15, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://ouvidoria.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://wiki.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://sedecti.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://eventos.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://semjel.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://semio.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

curl -X POST http://localhost:3000/api/sites -H "Content-Type: application/json" -d "{\"url\": \"https://semuc.tefe.am.gov.br\", \"check_time\": 10, \"webhook_url\": \"	https://webhook.site/1c31f315-a596-4ec7-ae84-70e931b7036e\"}"

echo Sites cadastrados com sucesso!
pause