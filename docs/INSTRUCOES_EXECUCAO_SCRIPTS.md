# 📋 Instruções para Execução dos Scripts de Atualização de Preços

## 🎯 Objetivo
Atualizar os preços dos produtos da Go Pizza Delivery conforme o cardápio anexado, organizados por categorias para evitar erros.

## 📁 Arquivos Criados

### 1. Scripts Separados por Categoria
- `script_atualizacao_precos_pizzas.sql` - Pizzas Clássicas, Especiais e Doces
- `script_atualizacao_ingredientes_bordas.sql` - Ingredientes e Bordas
- `script_atualizacao_combos_bebidas.sql` - Combos e Bebidas

### 2. Script Completo
- `script_completo_atualizacao_precos.sql` - Todas as atualizações em um arquivo

## 🚀 Como Executar

### Opção 1: Execução por Partes (Recomendado)
Execute os scripts separados na seguinte ordem:

1. **Primeiro**: Pizzas
```sql
-- Execute: script_atualizacao_precos_pizzas.sql
```

2. **Segundo**: Ingredientes e Bordas
```sql
-- Execute: script_atualizacao_ingredientes_bordas.sql
```

3. **Terceiro**: Combos e Bebidas
```sql
-- Execute: script_atualizacao_combos_bebidas.sql
```

### Opção 2: Execução Completa
Execute o script completo de uma vez:
```sql
-- Execute: script_completo_atualizacao_precos.sql
```

## 📊 Resumo das Atualizações

### Pizzas Clássicas (category_id: 8)
- **Preço Atualizado**: R$ 49.90 (Pizza G - 8 fatias)
- **Produtos Afetados**: 14 pizzas
- **Exemplos**: Americana, Bacon, Calabresa, Marguerita, etc.

### Pizzas Especiais (category_id: 9)
- **Preço Atualizado**: R$ 54.90 (Pizza G - 8 fatias)
- **Produtos Afetados**: 7 pizzas
- **Exemplos**: Brócolis com Bacon e Catupiry, Go Pizza Especial, etc.

### Pizzas Doces (category_id: 10)
- **Preço Atualizado**: R$ 49.90 (Pizza G - 8 fatias)
- **Produtos Afetados**: 5 pizzas
- **Exemplos**: Go Chocolate, Go Chocobis, Go Choconinho, etc.

### Ingredientes Extras (category_id: 11)
- **Preços Atualizados**: R$ 1.90 a R$ 14.90
- **Produtos Afetados**: 22 ingredientes
- **Exemplos**: Catupiry (R$ 9.90), Bacon (R$ 5.90), etc.

### Bordas (category_id: 12 e 13)
- **Preços Atualizados**: R$ 9.90 a R$ 19.90
- **Produtos Afetados**: 9 bordas
- **Exemplos**: Borda de Catupiry (R$ 9.90), Borda de Calabresa com Queijo (R$ 19.90)

### Combos (category_id: 14)
- **Preços Atualizados**: R$ 35.90 a R$ 204.90
- **Produtos Afetados**: 5 combos
- **Exemplos**: Combo 1 (R$ 74.90), Combo 2 (R$ 99.90)

### Bebidas (category_id: 15)
- **Preços Atualizados**: R$ 3.50 a R$ 14.90
- **Produtos Afetados**: 3 bebidas
- **Exemplos**: Refrigerante 200ml (R$ 3.50), Coca-Cola 2L (R$ 14.90)

## ⚠️ Cuidados Importantes

### 1. Backup
**SEMPRE faça backup da tabela `products` antes de executar os scripts!**
```sql
-- Exemplo de backup
CREATE TABLE products_backup AS SELECT * FROM products;
```

### 2. Teste em Ambiente de Desenvolvimento
Execute primeiro em ambiente de desenvolvimento para verificar se tudo está correto.

### 3. Verificação dos IDs
Os scripts usam os IDs dos produtos do arquivo JSON anexado. Verifique se os IDs estão corretos na sua base de dados.

### 4. Execução por Partes
Para evitar erros, execute uma categoria por vez e verifique os resultados antes de continuar.

## 🔍 Verificação dos Resultados

Após executar os scripts, use as consultas de verificação incluídas no final de cada script para confirmar se os preços foram atualizados corretamente:

```sql
-- Verificar pizzas clássicas
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 8 
ORDER BY name;

-- Verificar pizzas especiais
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 9 
ORDER BY name;

-- E assim por diante para cada categoria...
```

## 📞 Suporte

Se encontrar algum problema durante a execução:

1. Verifique se os IDs dos produtos estão corretos
2. Confirme se a estrutura da tabela está correta
3. Execute as consultas de verificação para identificar inconsistências
4. Em caso de erro, restaure o backup e tente novamente

## ✅ Checklist de Execução

- [ ] Backup da tabela `products` realizado
- [ ] Ambiente de desenvolvimento testado
- [ ] Scripts executados na ordem correta
- [ ] Consultas de verificação executadas
- [ ] Preços conferidos com o cardápio
- [ ] Ambiente de produção atualizado (se aplicável)

---

**Data de Criação**: $(date)
**Baseado no**: Cardápio Go Pizza Delivery anexado
**Categorias Mapeadas**: Conforme documento CATEGORIAS_PRODUTOS.md
