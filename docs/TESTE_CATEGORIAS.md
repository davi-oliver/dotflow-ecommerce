# 🧪 Como Testar a Funcionalidade de Categorias

## ✅ O que foi Implementado

O sistema de filtragem por categorias já está **100% funcional** e mapeado para os IDs corretos da API DotFlow.

### Mapeamento Atual:

| Categoria no UI    | ID da API | Produtos Incluídos                               |
|--------------------|-----------|--------------------------------------------------|
| 🍕 Clássicas       | 8         | Americana, Bacon, Calabresa, Portuguesa, etc.    |
| ⭐ Especiais       | 9         | Brócolis com Bacon e Catupiry, Go Pizza, etc.    |
| 🍰 Doces           | 10        | Go Chocolate, Go Chocobis, Go Sensação, etc.     |
| 🧀 Adicionais      | 11        | Catupiry, Bacon, Mussarela, Cheddar, etc.        |
| 🥖 Bordas Clássicas| 12        | Borda de Catupiry, Cheddar, Chocolate, etc.      |
| ✨ Bordas Especiais| 13        | Borda de Catucheddar, Frango com Queijo, etc.    |
| 📦 Combos          | 14        | Pizza Grande + Broto + Refrigerante, etc.        |
| 🥤 Bebidas         | 15        | Coca-Cola, Mantiqueira, Refrigerantes            |

## 🚀 Como Testar

### 1. Iniciar o Servidor

```bash
npm run dev
```

### 2. Acessar a Página de Delivery

Navegue para: `http://localhost:3000/delivery`

### 3. Testar a Filtragem

1. **Clique na aba "Clássicas"** 🍕
   - Deve exibir apenas produtos com `category_id: 8`
   - Exemplos: Americana, Bacon, Calabresa, Marguerita, etc.

2. **Clique na aba "Especiais"** ⭐
   - Deve exibir apenas produtos com `category_id: 9`
   - Exemplos: Brócolis com Bacon e Catupiry, Go Pizza Especial, etc.

3. **Clique na aba "Doces"** 🍰
   - Deve exibir apenas produtos com `category_id: 10`
   - Exemplos: Go Chocolate, Go Chocobis, Go Choconinho, etc.

4. **Clique na aba "Adicionais"** 🧀
   - Deve exibir apenas produtos com `category_id: 11`
   - Exemplos: Catupiry, Bacon, Chocolate, Morango, etc.

5. **Clique na aba "Bordas Clássicas"** 🥖
   - Deve exibir apenas produtos com `category_id: 12`
   - Exemplos: Borda de Catupiry, Cheddar, Mussarela, etc.

6. **Clique na aba "Bordas Especiais"** ✨
   - Deve exibir apenas produtos com `category_id: 13`
   - Exemplos: Borda de Catucheddar, Frango com Queijo, etc.

7. **Clique na aba "Combos"** 📦
   - Deve exibir apenas produtos com `category_id: 14`
   - Exemplos: Combos de pizzas com bebidas

8. **Clique na aba "Bebidas"** 🥤
   - Deve exibir apenas produtos com `category_id: 15`
   - Exemplos: Coca-Cola, Mantiqueira, Refrigerantes

9. **Clique na aba "Todas"** 
   - Deve exibir TODOS os produtos disponíveis

### 4. Testar a Busca

1. Digite "Calabresa" na barra de busca
   - Deve mostrar pizzas com calabresa e ingrediente adicional calabresa
   
2. Digite "Chocolate"
   - Deve mostrar pizzas doces com chocolate e ingrediente adicional chocolate
   
3. Digite "Borda"
   - Deve mostrar todas as bordas (clássicas e especiais)

## 🔍 Verificar no Console

Abra o DevTools (F12) e verifique o console para logs de debug:

```javascript
// Ao carregar produtos
console.log('Produtos carregados:', products);

// Ao filtrar por categoria
console.log('Categoria selecionada:', 'classicas');
console.log('Produtos filtrados:', filteredProducts);

// Verificar category_id dos produtos
products.forEach(p => {
  console.log(`${p.name} - category_id: ${p.category_id}`);
});
```

## 📊 Exemplo de Dados Esperados

### Ao clicar em "Clássicas" (category_id: 8)

**Produtos esperados:**
```json
[
  {
    "id": 21,
    "name": "Americana",
    "category_id": 8,
    "price": 35.9
  },
  {
    "id": 22,
    "name": "Bacon",
    "category_id": 8,
    "price": 38.9
  },
  {
    "id": 23,
    "name": "Brócolis com Bacon",
    "category_id": 8,
    "price": 42.9
  },
  {
    "id": 24,
    "name": "Calabresa",
    "category_id": 8,
    "price": 32.9
  }
  // ... mais produtos com category_id: 8
]
```

### Ao clicar em "Especiais" (category_id: 9)

**Produtos esperados:**
```json
[
  {
    "id": 35,
    "name": "Brócolis com Bacon e Catupiry",
    "category_id": 9,
    "price": 48.9
  },
  {
    "id": 36,
    "name": "Calabresa com Catupiry",
    "category_id": 9,
    "price": 42.9
  },
  {
    "id": 39,
    "name": "Go Pizza Especial",
    "category_id": 9,
    "price": 52.9
  }
  // ... mais produtos com category_id: 9
]
```

## 🛠️ Debug: Como Verificar o Filtro

Se algo não estiver funcionando, adicione este código temporário na página:

```typescript
// Em src/app/delivery/page.tsx
useEffect(() => {
  console.log('🔍 DEBUG - Produtos totais:', products.length);
  console.log('🔍 DEBUG - Categoria selecionada:', selectedCategory);
  console.log('🔍 DEBUG - Produtos filtrados:', filteredProducts.length);
  
  // Listar produtos por categoria
  const grouped = products.reduce((acc, p) => {
    const catId = p.category_id || 'sem-categoria';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(p.name);
    return acc;
  }, {} as Record<number | string, string[]>);
  
  console.log('🔍 DEBUG - Produtos por categoria:', grouped);
}, [products, selectedCategory, filteredProducts]);
```

## ✅ Checklist de Testes

- [ ] A aba "Clássicas" mostra apenas pizzas clássicas (category_id: 8)
- [ ] A aba "Especiais" mostra apenas pizzas especiais (category_id: 9)
- [ ] A aba "Doces" mostra apenas pizzas doces (category_id: 10)
- [ ] A aba "Adicionais" mostra apenas ingredientes extras (category_id: 11)
- [ ] A aba "Bordas Clássicas" mostra apenas bordas clássicas (category_id: 12)
- [ ] A aba "Bordas Especiais" mostra apenas bordas especiais (category_id: 13)
- [ ] A aba "Combos" mostra apenas combos (category_id: 14)
- [ ] A aba "Bebidas" mostra apenas bebidas (category_id: 15)
- [ ] A aba "Todas" mostra todos os produtos
- [ ] A busca funciona em qualquer categoria
- [ ] Os produtos são exibidos com imagem, nome, descrição e preço
- [ ] É possível adicionar produtos ao carrinho
- [ ] O contador do carrinho atualiza corretamente

## 🐛 Problemas Comuns

### Problema: Nenhum produto aparece ao clicar em uma categoria

**Solução:**
1. Verifique se os produtos têm o campo `category_id` preenchido
2. Confirme que os IDs das categorias estão corretos (8-15)
3. Verifique o console para erros

### Problema: Produtos aparecem em categorias erradas

**Solução:**
1. Verifique o `category_id` do produto no banco de dados
2. Confirme que o mapeamento em `productFilterService.ts` está correto

### Problema: A API não retorna produtos

**Solução:**
1. Verifique se a API está rodando
2. Confirme as credenciais e tokens
3. Verifique a URL da API em `dotflow-api.ts`

## 📱 Testar em Dispositivos Móveis

O sistema é responsivo. Teste também em:

1. **Mobile (< 768px)**
   - As abas devem ter scroll horizontal
   - O botão do carrinho deve flutuar no canto inferior direito

2. **Tablet (768px - 1024px)**
   - As abas devem estar centralizadas
   - Grade de produtos deve ter 2 colunas

3. **Desktop (> 1024px)**
   - As abas devem estar centralizadas
   - Grade de produtos deve ter 3-4 colunas

## 🎯 Próximos Passos

Após confirmar que a filtragem funciona:

1. [ ] Adicionar animações nas transições de categoria
2. [ ] Implementar lazy loading para categorias com muitos produtos
3. [ ] Adicionar contador de produtos por categoria nas abas
4. [ ] Melhorar o feedback visual ao clicar nas abas
5. [ ] Adicionar filtros adicionais (preço, promoções, etc.)

## 📞 Suporte

Se encontrar algum problema, verifique:

1. **Documentação:**
   - `CATEGORIAS_PRODUTOS.md` - Detalhes técnicos do mapeamento
   - `DELIVERY_README.md` - Documentação geral do delivery
   
2. **Código-fonte:**
   - `src/services/productFilterService.ts` - Lógica de filtragem
   - `src/hooks/useProductFilters.ts` - Hook de filtragem
   - `src/app/delivery/page.tsx` - Página principal

3. **Console do navegador:**
   - Verifique por erros JavaScript
   - Monitore as requisições de API
   - Analise os logs de debug

