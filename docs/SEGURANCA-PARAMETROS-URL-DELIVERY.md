# Segurança e LGPD - Parâmetros de URL na Página /delivery

## ⚠️ Análise de Segurança e LGPD

### Problemas ao Expor ID Direto na URL

1. **Riscos de Segurança:**
   - ✅ **Enumeração de IDs**: Atacantes podem tentar IDs sequenciais (1, 2, 3...) para acessar dados de outros clientes
   - ✅ **Histórico do Navegador**: IDs ficam salvos no histórico, logs de servidor, analytics
   - ✅ **Compartilhamento Acidental**: URLs com IDs podem ser compartilhadas acidentalmente
   - ✅ **Acesso Não Autorizado**: Se não houver validação adequada, qualquer pessoa com o ID pode acessar dados

2. **Questões de LGPD:**
   - ❌ **Dados Pessoais na URL**: IDs podem ser considerados dados pessoais se permitirem identificar o indivíduo
   - ❌ **Rastreabilidade**: URLs com IDs podem ser rastreadas por terceiros (analytics, logs)
   - ❌ **Consentimento**: Cliente não deu consentimento explícito para ter seu ID exposto na URL
   - ❌ **Minimização de Dados**: LGPD exige coletar apenas dados necessários

### ✅ Solução Recomendada: Token Temporário Assinado

**Ao invés de:**
```
/delivery?customer_id=123
```

**Usar:**
```
/delivery?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Vantagens:
1. ✅ **Não expõe ID direto**: Token é criptografado/assinado
2. ✅ **Tempo de expiração**: Token pode expirar após X minutos/horas
3. ✅ **Uso único (opcional)**: Token pode ser invalidado após primeiro uso
4. ✅ **Validação no Backend**: Backend valida o token antes de retornar dados
5. ✅ **Sem rastreabilidade direta**: Não é possível identificar o cliente apenas olhando a URL

## 🔐 Implementação Segura

### Opção 1: Token JWT Assinado (Recomendado)

**Fluxo:**
1. Sistema de automação WhatsApp gera token JWT com:
   - `customer_id` (no payload, não visível)
   - `exp` (expiração - ex: 1 hora)
   - `iat` (emitido em)
   - Assinatura secreta

2. URL enviada:
   ```
   /delivery?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcl9pZCI6MTIzLCJleHAiOjE2OTk5OTk5OTl9.signature
   ```

3. Frontend envia token para API
4. Backend valida token e retorna dados do cliente (se válido)

### Opção 2: Token Hash Simples (Mais Simples)

**Fluxo:**
1. Sistema gera hash: `hash = HMAC(customer_id + timestamp + secret_key)`
2. URL: `/delivery?ref=abc123def456&t=1699999999`
3. Backend valida hash e timestamp
4. Retorna dados se válido

### Opção 3: Link Único com UUID (Mais Seguro)

**Fluxo:**
1. Criar tabela `delivery_links`:
   ```sql
   CREATE TABLE delivery_links (
     id UUID PRIMARY KEY,
     customer_id INTEGER,
     expires_at TIMESTAMP,
     used_at TIMESTAMP NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Sistema cria link único: `/delivery?link=550e8400-e29b-41d4-a716-446655440000`
3. Backend valida link, verifica expiração e uso
4. Invalida após primeiro uso (opcional)

## 📋 Recomendações de Implementação

### 1. **Nunca Expor Dados Sensíveis na URL**
   - ❌ IDs diretos
   - ❌ Nomes completos
   - ❌ CPF/CNPJ
   - ❌ Telefones completos
   - ✅ Apenas tokens/hashes temporários

### 2. **Validação Obrigatória no Backend**
   - Sempre validar token/hash no servidor
   - Verificar expiração
   - Verificar se já foi usado (se aplicável)
   - Rate limiting para prevenir brute force

### 3. **Logs e Auditoria**
   - Logar tentativas de acesso com tokens inválidos
   - Monitorar padrões suspeitos
   - Não logar dados pessoais

### 4. **LGPD Compliance**
   - ✅ Informar cliente sobre uso de link personalizado
   - ✅ Permitir revogação do link
   - ✅ Limitar tempo de validade
   - ✅ Não armazenar dados desnecessários

## 🎯 Implementação Prática

Ver arquivo: `src/app/delivery/page.tsx` (implementação com token)

