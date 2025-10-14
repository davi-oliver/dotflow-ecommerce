# 📏 Sistema de Tamanhos de Pizza

## ✅ Regra Implementada

Os tamanhos são **obrigatórios** para pizzas e devem ser escolhidos **ANTES** de selecionar sabores, bordas e adicionais.

## 📊 Tabela de Preços

### Pizzas Clássicas e Doces (Categorias 8 e 10)
| Tamanho | Nome | Descrição | Preço |
|---------|------|-----------|-------|
| **P** | Pequena | Broto | R$ 32,90 |
| **M** | Média | Família | R$ 40,90 |
| **G** | Grande | GG | R$ 49,90 |

### Pizzas Especiais (Categoria 9)
| Tamanho | Nome | Descrição | Preço |
|---------|------|-----------|-------|
| **P** | Pequena | Broto | R$ 36,90 |
| **M** | Média | Família | R$ 45,90 |
| **G** | Grande | GG | R$ 54,90 |

## 🎯 Lógica de Preço

### Regra Principal:
1. **Preço base** é definido pelo **tamanho** escolhido
2. Se algum sabor for **Especial** (category_id: 9), usa **tabela de preços Especial**
3. Se todos os sabores forem **Clássica** (8) ou **Doce** (10), usa **tabela Clássica**

### Exemplos:

#### Exemplo 1: Pizza Clássica Tamanho G
```
Sabor: Americana (Clássica)
Tamanho: G
─────────────────────────
Preço: R$ 49,90 (Clássica G)
```

#### Exemplo 2: Pizza Especial Tamanho M
```
Sabor: Go Pizza Especial (Especial)
Tamanho: M
─────────────────────────
Preço: R$ 45,90 (Especial M)
```

#### Exemplo 3: Metade Clássica + Metade Especial, Tamanho G
```
Sabor 1: Americana (Clássica)
Sabor 2: Go Pizza (Especial)  ← Tem especial!
Tamanho: G
─────────────────────────
Preço: R$ 54,90 (Especial G)
```

#### Exemplo 4: Metade Clássica + Metade Doce, Tamanho P
```
Sabor 1: Marguerita (Clássica)
Sabor 2: Go Chocolate (Doce)
Tamanho: P
─────────────────────────
Preço: R$ 32,90 (Clássica P)
```

## 🎨 Interface do Usuário

### Seleção de Tamanho (Obrigatória)

A seleção de tamanho aparece em **destaque amarelo** no topo do modal, antes de todas as outras opções:

```
┌──────────────────────────────────────┐
│ 📏 Escolha o tamanho da sua pizza * │
│                                      │
│ Selecione o tamanho antes de        │
│ personalizar sua pizza               │
│                                      │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  P   │  │  M   │  │  G   │      │
│  │Pequena│ │Média │  │Grande│      │
│  │Broto │  │Família│ │  GG  │      │
│  │R$32,90│ │R$40,90│ │R$49,90│     │
│  └──────┘  └──────┘  └──────┘      │
│                                      │
│  ⚠️ Selecione um tamanho para       │
│     continuar                        │
└──────────────────────────────────────┘
```

### Estado Bloqueado

Antes de selecionar o tamanho, as seções de sabores, bordas e adicionais ficam **bloqueadas** (opacity 50% e pointer-events-none):

```
┌──────────────────────────────────────┐
│ 🍕 Deseja metade de outro sabor?    │
│                                      │
│ 🔒 Selecione um tamanho primeiro     │
│    para personalizar sua pizza       │
└──────────────────────────────────────┘
```

### Após Selecionar o Tamanho

Quando o cliente seleciona um tamanho:
- ✅ Tamanho fica destacado em vermelho
- ✅ Seções de personalização são liberadas
- ✅ Dica explicativa é exibida
- ✅ Preço atualiza automaticamente

## 💰 Cálculo de Preço Completo

### Fórmula:

```typescript
const precoBase = sizePrices[categoria][tamanho];
const precoBorda = borda?.price || 0;
const precoAdicionais = sum(adicionais.map(a => a.price));

const total = (precoBase + precoBorda + precoAdicionais) * quantidade;
```

### Exemplo Completo:

```
Pizza Tamanho G - Metade Clássica + Metade Especial
Sabor 1: Americana (Clássica)
Sabor 2: Go Pizza (Especial)  ← Define preço Especial
Tamanho: G
Borda: Catupiry (R$ 12,90)
Adicionais: Bacon (R$ 6,90) + Azeitona (R$ 3,90)
Quantidade: 2

Cálculo:
Pizza G Especial:  R$ 54,90  ← Especial porque tem Go Pizza
Borda:            +R$ 12,90
Adicionais:       +R$ 10,80
──────────────────────────────
Subtotal:          R$ 78,60
Quantidade:        x2
──────────────────────────────
TOTAL:             R$ 157,20
```

## 🔄 Atualização Dinâmica de Preço

O preço **atualiza automaticamente** quando:

1. ✅ Cliente escolhe um tamanho
2. ✅ Cliente adiciona/remove sabor Especial
3. ✅ Cliente muda de tamanho

**Exemplo de atualização:**

```
Inicial:
- Tamanho G
- Sabor: Americana (Clássica)
- Preço: R$ 49,90 (Clássica G)

Cliente adiciona metade Go Pizza (Especial):
- Tamanho G (mesmo)
- Sabores: Americana + Go Pizza
- Preço: R$ 54,90 (Especial G) ← Atualizou!
```

## 📱 Resumo no Modal

O resumo de preço mostra o detalhamento completo:

```
┌──────────────────────────────────────┐
│ Quantidade           [ - ] 2 [ + ]  │
├──────────────────────────────────────┤
│ Total                  R$ 157,20     │ ← Grande
├──────────────────────────────────────┤
│ Pizza Tamanho G (2 sabores)         │
│ - Especial            R$ 54,90       │
│ Borda (Catupiry)     +R$ 12,90       │
│ Adicionais (2)       +R$ 10,80       │
└──────────────────────────────────────┘
```

## 🛒 No Carrinho

O CarrinhoContext também usa a tabela de preços por tamanho:

```typescript
// Se o item é uma pizza e tem tamanho
if (isPizza && item.options?.size) {
  const hasEspecial = item.options.flavors?.some(f => f.category_id === 9);
  const priceCategory = hasEspecial ? 'especial' : 'classica';
  pizzaPrice = sizePrices[priceCategory][item.options.size];
}
```

## ✅ Validações

### 1. Tamanho Obrigatório para Pizzas
```typescript
if (isPizza && !selectedSize) {
  alert('Por favor, selecione o tamanho da pizza antes de adicionar ao carrinho.');
  return;
}
```

### 2. Preço Zero se Não Tiver Tamanho
```typescript
if (isPizza && !selectedSize) {
  return 0; // Total aparece como R$ 0,00
}
```

### 3. Bloqueio de Personalização
```typescript
className={`${!selectedSize ? 'opacity-50 pointer-events-none' : ''}`}
```

## 🧪 Casos de Teste

### Teste 1: Seleção de Tamanho P Clássica
```
1. Abrir modal de pizza Clássica
2. Verificar que personalização está bloqueada
3. Clicar em tamanho P
4. Verificar que preço mostra R$ 32,90
5. Verificar que personalização foi liberada
```

### Teste 2: Mudança de Clássica para Especial
```
1. Selecionar tamanho G (R$ 49,90)
2. Pizza inicial é Clássica
3. Adicionar metade Go Pizza (Especial)
4. Verificar que preço mudou para R$ 54,90
5. Remover Go Pizza
6. Verificar que preço voltou para R$ 49,90
```

### Teste 3: Todos os Tamanhos
```
Para cada tamanho (P, M, G):
  - Testar com pizza Clássica
  - Testar com pizza Especial
  - Verificar preços corretos
  - Verificar que borda e adicionais somam corretamente
```

### Teste 4: Validação de Adicionar ao Carrinho
```
1. Abrir modal de pizza
2. NÃO selecionar tamanho
3. Tentar adicionar ao carrinho
4. Verificar que aparece alerta
5. Selecionar tamanho
6. Adicionar ao carrinho
7. Verificar que foi adicionado corretamente
```

## 📊 Mapeamento de Categorias

| Category ID | Nome | Tabela de Preço |
|-------------|------|-----------------|
| 8 | Clássicas | Clássica (P: R$32,90 / M: R$40,90 / G: R$49,90) |
| 9 | Especiais | Especial (P: R$36,90 / M: R$45,90 / G: R$54,90) |
| 10 | Doces | Clássica (P: R$32,90 / M: R$40,90 / G: R$49,90) |

## 🔧 Implementação Técnica

### Definição de Preços
```typescript
const sizePrices = {
  classica: { P: 32.90, M: 40.90, G: 49.90 },
  especial: { P: 36.90, M: 45.90, G: 54.90 }
};
```

### Determinar Categoria
```typescript
const hasEspecial = selectedFlavors.some(f => f.category_id === 9);
const priceCategory = hasEspecial ? 'especial' : 'classica';
```

### Calcular Preço
```typescript
const pizzaPrice = isPizza && selectedSize 
  ? sizePrices[priceCategory][selectedSize]
  : (product.price_offer || product.price);
```

## 🎓 FAQ

**P: Por que pizzas Doces usam preço de Clássicas?**
R: Por decisão de negócio, pizzas doces têm o mesmo preço que as clássicas.

**P: O que acontece se eu mudar o tamanho depois de personalizar?**
R: O preço atualiza automaticamente. Suas personalizações (sabores, borda, adicionais) são mantidas.

**P: Posso ter pizza metade Clássica + metade Especial no tamanho P?**
R: Sim! O preço será o da tabela Especial tamanho P (R$ 36,90).

**P: Se eu escolher 2 sabores Especiais diferentes, como fica o preço?**
R: O preço é da tabela Especial para o tamanho escolhido. Não importa se são 1 ou 2 sabores especiais.

## 📈 Benefícios da Implementação

✅ **Clareza de Preço**: Cliente sabe exatamente quanto vai pagar desde o início
✅ **Flexibilidade**: 3 opções de tamanho para diferentes necessidades
✅ **Validação**: Impossível adicionar pizza sem tamanho
✅ **Atualização Dinâmica**: Preço muda em tempo real
✅ **Visual Destacado**: Seleção de tamanho é impossível de perder
✅ **Bloqueio Inteligente**: Evita confusão ao bloquear personalização

## 🎉 Conclusão

O sistema de tamanhos garante que:

1. **Cliente escolhe tamanho primeiro** (obrigatório)
2. **Preço é baseado no tamanho** e categoria dos sabores
3. **Especial sempre usa preço mais alto**
4. **Interface clara e intuitiva**
5. **Validações impedem erros**

**Tudo funcionando perfeitamente!** 🚀

