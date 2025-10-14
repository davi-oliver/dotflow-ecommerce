# 💰 Regra de Preço para Metades de Pizza

## ✅ Regra Oficial

Quando o cliente escolhe **2 sabores (metade a metade)**, o preço final é sempre o **MAIOR PREÇO** entre os sabores selecionados.

**NÃO somamos metade do segundo sabor!**

## 📊 Exemplos Práticos

### Exemplo 1: Clássica + Clássica
```
Sabor 1: Americana (Clássica) - R$ 35,90
Sabor 2: Calabresa (Clássica) - R$ 32,90
────────────────────────────────────────
Preço Final: R$ 35,90 (maior preço)
```

### Exemplo 2: Clássica + Especial
```
Sabor 1: Americana (Clássica) - R$ 35,90
Sabor 2: Go Pizza Especial (Especial) - R$ 52,90
────────────────────────────────────────
Preço Final: R$ 52,90 (maior preço = Especial)
```

### Exemplo 3: Especial + Clássica
```
Sabor 1: Go Pizza Especial (Especial) - R$ 52,90
Sabor 2: Americana (Clássica) - R$ 35,90
────────────────────────────────────────
Preço Final: R$ 52,90 (maior preço = Especial)
```

### Exemplo 4: Especial + Especial
```
Sabor 1: Brócolis com Bacon e Catupiry (Especial) - R$ 48,90
Sabor 2: Go Pizza Especial (Especial) - R$ 52,90
────────────────────────────────────────
Preço Final: R$ 52,90 (maior preço)
```

### Exemplo 5: Clássica + Doce
```
Sabor 1: Marguerita (Clássica) - R$ 36,90
Sabor 2: Go Chocolate (Doce) - R$ 32,90
────────────────────────────────────────
Preço Final: R$ 36,90 (maior preço = Clássica)
```

## 💡 Lógica por Trás da Regra

### Por que sempre o maior preço?

1. **Simplicidade**: Fácil de calcular e entender
2. **Justo para o restaurante**: Não perde margem em pizzas mais elaboradas
3. **Justo para o cliente**: Não paga mais caro por combinar sabores

### Comparação com regras antigas:

**❌ Regra Antiga (ERRADA):**
```
Base: R$ 35,90
+ Metade: R$ 52,90 ÷ 2 = R$ 26,45
────────────────────────────────────
Total: R$ 62,35
```

**✅ Regra Nova (CORRETA):**
```
Sabor 1: R$ 35,90
Sabor 2: R$ 52,90
────────────────────────────────────
Total: R$ 52,90 (maior preço)
```

## 🎯 Categorias de Preço

Geralmente a hierarquia de preços é:

1. **Especiais** (categoria 9) - Mais caras
2. **Clássicas** (categoria 8) - Preço médio
3. **Doces** (categoria 10) - Varia

**Mas a regra é simples:** Sempre pega o **maior preço**, independente da categoria!

## 🧮 Implementação Técnica

### No Modal (ProductModal.tsx):

```typescript
const calculateTotalPrice = () => {
  // Regra de preço para metades:
  // Quando tem 2 sabores, o preço é sempre o MAIOR entre eles
  const flavorsPrice = selectedFlavors.length > 1
    ? Math.max(...selectedFlavors.map(f => f.price_offer || f.price))
    : (product.price_offer || product.price);
  
  const borderPrice = selectedBorder ? (selectedBorder.price_offer || selectedBorder.price) : 0;
  const extrasPrice = selectedExtras.reduce((sum, e) => sum + (e.price_offer || e.price), 0);

  return (flavorsPrice + borderPrice + extrasPrice) * quantity;
};
```

### No Carrinho (CartContext.tsx):

```typescript
const getTotalPrice = () => {
  return items.reduce((total, item) => {
    // Regra: sempre o maior preço entre os sabores
    let pizzaPrice = item.product.price_offer || item.product.price;
    
    if (item.options?.flavors && item.options.flavors.length > 1) {
      pizzaPrice = Math.max(
        ...item.options.flavors.map(f => f.price_offer || f.price)
      );
    }
    
    // + Borda + Adicionais
    let optionsPrice = 0;
    if (item.options?.border) {
      optionsPrice += item.options.border.price_offer || item.options.border.price;
    }
    if (item.options?.extras) {
      optionsPrice += item.options.extras.reduce(
        (sum, extra) => sum + (extra.price_offer || extra.price), 0
      );
    }
    
    return total + ((pizzaPrice + optionsPrice) * item.quantity);
  }, 0);
};
```

## 📱 Interface do Usuário

### Dica no Modal:

```
💡 Dica: Escolha até 2 sabores para sua pizza. 
O valor final será sempre o maior preço entre os 
sabores escolhidos. Não somamos metade!
```

### Detalhamento no Resumo:

Quando o cliente seleciona 2 sabores:

```
┌─────────────────────────────────────┐
│ Pizza (2 sabores)      R$ 52,90    │ ← Maior preço
│ Borda (Catupiry)      +R$ 12,90    │
│ Adicionais (2)        +R$ 15,80    │
├─────────────────────────────────────┤
│ Total                  R$ 81,60    │
└─────────────────────────────────────┘
```

## ✅ Validação da Regra

### Casos de Teste:

| Sabor 1 | Preço 1 | Sabor 2 | Preço 2 | Resultado Esperado | Status |
|---------|---------|---------|---------|-------------------|--------|
| Americana | R$ 35,90 | Calabresa | R$ 32,90 | R$ 35,90 | ✅ |
| Marguerita | R$ 36,90 | Go Pizza | R$ 52,90 | R$ 52,90 | ✅ |
| Go Pizza | R$ 52,90 | Americana | R$ 35,90 | R$ 52,90 | ✅ |
| Go Chocolate | R$ 32,90 | Go Sensação | R$ 34,90 | R$ 34,90 | ✅ |
| Portuguesa | R$ 44,90 | 4 Queijos | R$ 45,90 | R$ 45,90 | ✅ |

## 🎓 Orientação ao Cliente

### FAQ:

**P: Por que pago o preço mais caro?**
R: Você está levando os ingredientes da pizza mais elaborada em metade da pizza. É justo pagar pelo valor dela!

**P: E se eu pedir só a pizza mais cara inteira?**
R: O preço é o mesmo! Metade a metade é uma vantagem para experimentar 2 sabores pelo preço de 1.

**P: Posso escolher 3 ou 4 sabores?**
R: Não, no momento permitimos apenas até 2 sabores (metade a metade).

**P: E se os preços forem iguais?**
R: Nesse caso, tanto faz! O Math.max() retorna o mesmo valor.

## 📊 Cenários Completos

### Cenário 1: Cliente Econômico
```
Cliente escolhe:
- Marguerita (R$ 36,90)
- Calabresa (R$ 32,90)

Paga: R$ 36,90 ✅
Economiza: R$ 0 (já é o preço base)
Ganho: Experimenta 2 sabores!
```

### Cenário 2: Cliente que quer Especial + Clássica
```
Cliente escolhe:
- Go Pizza Especial (R$ 52,90)
- Americana (R$ 35,90)

Paga: R$ 52,90 ✅
Ganho: Metade Americana "de brinde"
```

### Cenário 3: Pizza Completa
```
Cliente escolhe:
- Base: Portuguesa (R$ 44,90)
- Metade: 4 Queijos (R$ 45,90)
- Borda: Catupiry (R$ 12,90)
- Extras: Bacon (R$ 6,90) + Azeitona (R$ 3,90)

Cálculo:
Pizza: R$ 45,90 (maior preço)
Borda: R$ 12,90
Extras: R$ 10,80
─────────────────
Total: R$ 69,60
```

## 🔧 Manutenção

### Como Alterar a Regra:

Se no futuro precisar mudar a lógica de preço:

1. **Localizar os cálculos:**
   - `src/components/delivery/ProductModal.tsx` → `calculateTotalPrice()`
   - `src/contexts/CartContext.tsx` → `getTotalPrice()`

2. **Modificar a lógica:**
   - Trocar `Math.max()` pela nova fórmula
   - Atualizar comentários no código
   - Atualizar dica no modal
   - Atualizar este documento

3. **Testar todos os casos:**
   - Metade Clássica + Clássica
   - Metade Clássica + Especial
   - Metade Especial + Especial
   - Com e sem borda
   - Com e sem adicionais

## ✅ Conclusão

A regra é **simples e justa**:

> **Metade a metade = Preço do sabor mais caro**

Isso garante:
- ✅ Facilidade de cálculo
- ✅ Justiça para o restaurante
- ✅ Clareza para o cliente
- ✅ Simplicidade na implementação

**NÃO somamos metade do segundo sabor!**

