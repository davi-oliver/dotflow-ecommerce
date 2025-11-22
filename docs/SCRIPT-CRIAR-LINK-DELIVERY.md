# Script para Criar Links de Delivery Personalizados

## 📋 Contexto

Este script é para ser usado pela ferramenta de automação do WhatsApp para gerar links seguros para o cardápio digital.

 Gerar Token via API 

Criar endpoint para gerar tokens:

```typescript
// POST /api/delivery-links/create
{
  "customer_id": 123,
  "expires_in_hours": 24
}

// Resposta:
{
  "token": "token_gerado",
  "ref": "ref_gerado",
  "url": "https://seusite.com/delivery?token=...",
  "expires_at": "2024-01-01T12:00:00Z"
}
```


## 🔒 Validações Importantes

1. ✅ Token deve expirar (recomendado: 24-48 horas)
2. ✅ Validar token no backend antes de retornar dados
3. ✅ Logar tentativas de acesso com tokens inválidos
4. ✅ Rate limiting para prevenir brute force
5. ✅ Não expor dados sensíveis na URL

## 📊 Tabela delivery_links (SQL)

```sql
CREATE TABLE delivery_links (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  ref VARCHAR(255) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customer_data(id),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100) -- Sistema que criou (ex: 'whatsapp_bot')
);

CREATE INDEX idx_delivery_links_token ON delivery_links(token);
CREATE INDEX idx_delivery_links_ref ON delivery_links(ref);
CREATE INDEX idx_delivery_links_customer ON delivery_links(customer_id);
CREATE INDEX idx_delivery_links_expires ON delivery_links(expires_at);
```

