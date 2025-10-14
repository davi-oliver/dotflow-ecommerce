# 💰 Atualização: Preços na Listagem Baseados no Tamanho

## ✅ O que foi implementado

Agora a listagem de sabores exibe o **preço correto baseado no tamanho selecionado**, deixando claro para o cliente quanto ele vai pagar.

## 📊 Como Funciona

### Antes da Seleção de Tamanho
Quando o cliente ainda não selecionou um tamanho, os sabores mostram o **preço original da API** (apenas referência):

```
┌─────────────────────────────────┐
│ Americana                       │
│ Molho, mussarela, bacon         │
│                     R$ 35,90    │ ← Preço da API
└─────────────────────────────────┘
```

### Após Selecionar Tamanho P
Quando o cliente seleciona tamanho **P**, todos os sabores mostram o preço correto:

**Clássicas:**
```
┌─────────────────────────────────┐
│ Americana                       │
│ Molho, mussarela, bacon         │
│              R$ 32,90  Tam. P   │ ← Preço Clássica P
└─────────────────────────────────┘
```

**Especiais:**
```
┌─────────────────────────────────┐
│ Go Pizza Especial [Especial]   │ ← Badge amarelo
│ Bacon, frango, calabresa...     │
│              R$ 36,90  Tam. P   │ ← Preço Especial P
└─────────────────────────────────┘
```

### Atualização Dinâmica ao Mudar Tamanho

Se o cliente mudar de **P para G**, os preços atualizam automaticamente:

**Tamanho P → G (Clássicas):**
- Antes: R$ 32,90 (P)
- Depois: R$ 49,90 (G)

**Tamanho P → G (Especiais):**
- Antes: R$ 36,90 (P)
- Depois: R$ 54,90 (G)

## 🎯 Lógica de Cálculo

### Para Cada Sabor na Listagem:

```typescript
// 1. Verificar se tem tamanho selecionado
if (selectedSize) {
  // 2. Determinar se seria especial (sabor atual OU já tem especial)
  const wouldBeEspecial = flavor.category_id === 9 || 
                         selectedFlavors.some(f => f.category_id === 9);
  
  // 3. Escolher tabela de preços
  const priceCategory = wouldBeEspecial ? 'especial' : 'classica';
  
  // 4. Pegar preço da tabela
  displayPrice = sizePrices[priceCategory][selectedSize];
}
```

### Regras:

1. **Sabor Especial** → Sempre mostra preço **Especial** do tamanho
2. **Já tem Especial selecionado** → Todos os sabores mostram preço **Especial**
3. **Todos Clássicos/Doces** → Mostra preço **Clássica** do tamanho

## 💡 Badge "Especial"

Sabores da categoria Especial (category_id: 9) ganham um badge amarelo:

```
┌──────────────────────────────────────┐
│ Go Pizza Especial [🟡 Especial]    │
│                                      │
│                    R$ 54,90  Tam. G │
└──────────────────────────────────────┘
```

## 📱 Exemplos Práticos

### Exemplo 1: Cliente Escolhe Tamanho M

**Lista de Clássicas:**
- Americana: R$ 40,90 Tam. M
- Calabresa: R$ 40,90 Tam. M
- Marguerita: R$ 40,90 Tam. M
- Portuguesa: R$ 40,90 Tam. M

**Lista de Especiais:**
- Go Pizza: R$ 45,90 Tam. M [Especial]
- Brócolis com Bacon e Catupiry: R$ 45,90 Tam. M [Especial]
- Frango Especial: R$ 45,90 Tam. M [Especial]

**Lista de Doces:**
- Go Chocolate: R$ 40,90 Tam. M
- Go Sensação: R$ 40,90 Tam. M

### Exemplo 2: Cliente Seleciona uma Especial

**Situação Inicial (Tamanho G):**
- Cliente seleciona: Americana (Clássica)
- Lista mostra Clássicas: R$ 49,90

**Depois de Adicionar Go Pizza (Especial):**
- Cliente tem: Americana + Go Pizza
- Lista TODA atualiza para: R$ 54,90 (Especial)
- **Motivo:** Tem um sabor Especial, então usa tabela Especial

### Exemplo 3: Cliente Remove a Especial

**Situação Inicial (Tamanho G):**
- Cliente tem: Americana + Go Pizza
- Lista mostra: R$ 54,90 (Especial)

**Depois de Remover Go Pizza:**
- Cliente tem: Só Americana (Clássica)
- Lista TODA volta para: R$ 49,90 (Clássica)
- **Motivo:** Não tem mais Especial, volta para Clássica

## 🎨 Interface Visual

### Estrutura do Card de Sabor:

```
┌─────────────────────────────────────────┐
│ Nome do Sabor [Badge Especial]         │ ← Nome + Badge (se Especial)
│ Descrição breve do sabor                │ ← Descrição
│                                          │
│                    R$ XX,XX  Tam. X     │ ← Preço + Tamanho
└─────────────────────────────────────────┘
```

### Estados Visuais:

**Não Selecionado:**
- Border: Cinza claro
- Background: Branco/Transparente
- Hover: Border vermelha suave

**Selecionado:**
- Border: Vermelha forte
- Background: Vermelho claro
- Shadow: Sombra elevada
- Texto: Vermelho

**Desabilitado (já tem 2 sabores):**
- Opacity: 50%
- Cursor: Not-allowed
- Sem hover effect

## 📊 Comparação Antes x Depois

### ANTES (Preços da API):
```
Clássicas:
├─ Americana      R$ 35,90  ❌ Confuso
├─ Calabresa      R$ 32,90  ❌ Confuso
└─ Portuguesa     R$ 44,90  ❌ Confuso

Especiais:
├─ Go Pizza       R$ 52,90  ❌ Confuso
└─ Brócolis       R$ 48,90  ❌ Confuso
```

### DEPOIS (Preços por Tamanho G):
```
Clássicas:
├─ Americana      R$ 49,90  Tam. G  ✅ Claro
├─ Calabresa      R$ 49,90  Tam. G  ✅ Claro
└─ Portuguesa     R$ 49,90  Tam. G  ✅ Claro

Especiais:
├─ Go Pizza       R$ 54,90  Tam. G  ✅ Claro
└─ Brócolis       R$ 54,90  Tam. G  ✅ Claro
```

## ✅ Benefícios

1. **Clareza de Preço** 💰
   - Cliente vê exatamente quanto vai pagar
   - Não há surpresas no total

2. **Transparência** 📊
   - Mostra o tamanho ao lado do preço
   - Badge indica pizzas Especiais

3. **Atualização em Tempo Real** ⚡
   - Muda de tamanho → Preços atualizam
   - Adiciona/remove Especial → Preços ajustam

4. **Feedback Visual** 👁️
   - Badge amarelo para Especiais
   - Texto "Tam. X" indica tamanho atual
   - Cores diferentes para selecionado/não-selecionado

5. **Consistência** 🎯
   - Preço da lista = Preço do cálculo
   - Sem divergências ou confusões

## 🧪 Casos de Teste

### Teste 1: Mudança de Tamanho
```
1. Selecionar tamanho P
2. Verificar que Clássicas mostram R$ 32,90
3. Verificar que Especiais mostram R$ 36,90
4. Mudar para tamanho G
5. Verificar que Clássicas mostram R$ 49,90
6. Verificar que Especiais mostram R$ 54,90
```

### Teste 2: Adicionar Sabor Especial
```
1. Selecionar tamanho M
2. Lista mostra Clássicas: R$ 40,90
3. Selecionar uma Clássica (Americana)
4. Adicionar uma Especial (Go Pizza)
5. Verificar que lista TODA atualiza para R$ 45,90
6. Badge "Especial" aparece em Go Pizza
```

### Teste 3: Remover Sabor Especial
```
1. Ter Americana + Go Pizza (Especial)
2. Tamanho G - Lista mostra R$ 54,90
3. Remover Go Pizza
4. Verificar que lista volta para R$ 49,90 (Clássica)
```

### Teste 4: Sem Tamanho Selecionado
```
1. Abrir modal
2. Não selecionar tamanho
3. Verificar que sabores mostram preço da API
4. Verificar que não aparece "Tam. X"
5. Selecionar tamanho
6. Verificar que preços atualizam
7. Verificar que aparece "Tam. X"
```

## 🔧 Implementação Técnica

### Código Principal:

```typescript
// Calcular preço para exibição
let displayPrice = flavor.price_offer || flavor.price;

if (selectedSize) {
  // Verifica se seria especial
  const wouldBeEspecial = 
    flavor.category_id === 9 || 
    selectedFlavors.some(f => f.category_id === 9);
  
  // Escolhe tabela
  const priceCategory = wouldBeEspecial ? 'especial' : 'classica';
  
  // Pega preço correto
  displayPrice = sizePrices[priceCategory][selectedSize];
}
```

### JSX do Card:

```tsx
<div className="text-right ml-3">
  <div className="font-semibold">
    {formatPrice(displayPrice)}
  </div>
  {selectedSize && (
    <div className="text-xs text-gray-500">
      Tam. {selectedSize}
    </div>
  )}
</div>
```

### Badge Especial:

```tsx
{selectedSize && flavor.category_id === 9 && (
  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
    Especial
  </span>
)}
```

## 🎓 Perguntas Frequentes

**P: Por que alguns sabores ficam mais caros quando adiciono uma Especial?**
R: Quando você tem pelo menos um sabor Especial, TODA a pizza passa a usar a tabela de preços Especial, que é mais cara. Isso reflete os ingredientes premium.

**P: Posso ver o preço antes de selecionar o tamanho?**
R: Sim, você vê o preço original da API, mas é apenas referência. O preço real depende do tamanho escolhido.

**P: Por que o badge "Especial" só aparece depois de selecionar o tamanho?**
R: Para deixar claro que o preço está usando a tabela Especial. Antes de selecionar, não faz sentido mostrar o badge.

**P: Se eu remover a Especial, o preço cai?**
R: Sim! Se você remover todos os sabores Especiais, a lista volta a mostrar preços da tabela Clássica.

## 📈 Resultado Final

### Cliente agora vê:

```
📏 Tamanho G selecionado

🍕 Pizzas Clássicas (14)
├─ Americana         R$ 49,90  Tam. G
├─ Calabresa         R$ 49,90  Tam. G
└─ Marguerita        R$ 49,90  Tam. G

⭐ Pizzas Especiais (8)
├─ Go Pizza [Especial]      R$ 54,90  Tam. G
├─ Brócolis [Especial]      R$ 54,90  Tam. G
└─ Frango [Especial]        R$ 54,90  Tam. G

🍰 Pizzas Doces (5)
├─ Go Chocolate      R$ 49,90  Tam. G
└─ Go Sensação       R$ 49,90  Tam. G
```

### Cálculo do Total:
- Preço mostrado na lista = Preço usado no cálculo
- Total final = Soma exata dos preços exibidos
- Zero surpresas! ✅

## 🎉 Conclusão

A atualização garante:

✅ **Transparência Total**: Cliente sabe o preço exato antes de selecionar
✅ **Clareza Visual**: Badge e tamanho indicam categoria e tamanho
✅ **Cálculo Correto**: Preço da lista = Preço do total
✅ **Atualização Dinâmica**: Muda em tempo real conforme seleções
✅ **Melhor UX**: Cliente informado toma melhores decisões

**Agora o sistema está completo e profissional!** 🚀

