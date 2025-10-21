#!/bin/bash
echo "🧪 INICIANDO TESTES RÁPIDOS DA API..."
echo "======================================"

echo "1️⃣ Testando Health Check..."
curl -s http://localhost:3000/health
echo -e "\n"

echo "2️⃣ Listando sites..."
curl -s http://localhost:3000/api/sites
echo -e "\n"

echo "3️⃣ Adicionando site de teste..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -d '{"url":"https://httpbin.org/status/200","check_time":1}')
echo "Resposta: $RESPONSE"

# Extrai o ID manualmente (sem jq)
SITE_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "📝 Site ID: $SITE_ID"
echo -e "\n"

if [ ! -z "$SITE_ID" ] && [ "$SITE_ID" != "null" ]; then
    echo "4️⃣ Forçando verificação..."
    curl -s -X POST http://localhost:3000/api/sites/$SITE_ID/check
    echo -e "\n"
    
    echo "5️⃣ Verificando histórico..."
    curl -s http://localhost:3000/api/sites/$SITE_ID/checks
    echo -e "\n"
else
    echo "❌ Não foi possível obter o Site ID"
fi

echo "6️⃣ Testando dashboard..."
curl -s http://localhost:3000/api/reports/dashboard
echo -e "\n"

echo "✅ TESTES CONCLUÍDOS!"