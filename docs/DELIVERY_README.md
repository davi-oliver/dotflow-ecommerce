# 🍕 Cardápio Digital - Pizza Delivery

## Visão Geral

O cardápio digital é uma nova feature focada em delivery de pizzas, oferecendo uma experiência otimizada para pedidos online. A aplicação mantém a funcionalidade do e-commerce tradicional, mas com uma interface específica para delivery.

## Funcionalidades Implementadas

### 🎯 Página Principal (/delivery)
- Interface dedicada para delivery de pizzas
- Navegação específica sem acesso direto ao e-commerce
- Design moderno e responsivo

### 🍕 Categorias de Pizzas
- **Clássicas**: Margherita, Pepperoni, Portuguesa, Calabresa, Napolitana
- **Doces**: Chocolate, Morango, Banana, Prestígio
- **Especiais**: Pizzas gourmet e artesanais

### ⭐ Recursos do Produto
- **Botão de Favoritar**: Permite marcar produtos como favoritos
- **Avaliações**: Sistema de estrelas (4.2/5)
- **Preços**: Suporte a preços promocionais
- **Imagens**: Mapeamento automático de imagens baseado no nome do produto

### 🎛️ Modal de Personalização
- **Seleção de Sabores**: Até 2 sabores por pizza
- **Tamanhos**: Pequena, Média, Grande, Família (com preços diferenciados)
- **Bordas**: Tradicional, Catupiry, Cheddar, Chocolate
- **Adicionais**: Bacon, Cebola, Azeitona, Tomate, Orégano, Pimenta
- **Quantidade**: Controle de quantidade com botões +/- 

### 🛒 Carrinho Inteligente
- **Opções Detalhadas**: Exibe sabores, tamanho, borda e adicionais
- **Cálculo de Preço**: Considera todas as opções selecionadas
- **Botão Flutuante**: Acesso rápido ao carrinho
- **Persistência**: Mantém itens no localStorage

### 🧭 Navegação
- **Header Específico**: Design focado em delivery
- **Navegação de Retorno**: Permite voltar ao e-commerce
- **Contexto Isolado**: Mantém usuário no ambiente de delivery

## Estrutura de Arquivos

```
src/
├── app/delivery/
│   ├── layout.tsx          # Layout específico para delivery
│   └── page.tsx            # Página principal do delivery
├── components/delivery/
│   ├── DeliveryHeader.tsx      # Header específico
│   ├── DeliveryNavigation.tsx  # Navegação de retorno
│   ├── CategoryTabs.tsx        # Abas de categorias
│   ├── ProductGrid.tsx         # Grid de produtos
│   ├── ProductModal.tsx        # Modal de personalização
│   ├── CartFloatingButton.tsx  # Botão flutuante do carrinho
│   └── DeliveryLayout.tsx      # Layout wrapper
└── types/
    └── delivery.ts             # Tipos específicos do delivery
```

## Como Usar

### 1. Acessar o Delivery
```
http://localhost:3000/delivery
```

### 2. Navegar pelas Categorias
- Use as abas para filtrar por tipo de pizza
- Clique nos produtos para ver detalhes

### 3. Personalizar o Pedido
- Selecione até 2 sabores
- Escolha o tamanho desejado
- Adicione borda especial (opcional)
- Inclua adicionais conforme preferência
- Ajuste a quantidade

### 4. Finalizar Pedido
- Clique no botão flutuante do carrinho
- Revise os itens e opções
- Prossiga para o checkout

## Integração com API

A aplicação utiliza a API DotFlow existente:
- **Produtos**: `dotflowAPI.getProducts()`
- **Categorias**: `dotflowAPI.getCategories()`
- **Carrinho**: Integrado com `CartContext`

## Personalização

### Adicionar Novos Sabores
Edite o array `availableFlavors` em `ProductModal.tsx`:

```typescript
const availableFlavors = [
  'Margherita', 'Pepperoni', 'Portuguesa', 
  'Calabresa', 'Napolitana', 'Novo Sabor'
];
```

### Modificar Categorias
Atualize o array `pizzaCategories` em `page.tsx`:

```typescript
const pizzaCategories = [
  { id: 'all', name: 'Todas', icon: '🍕' },
  { id: 'nova-categoria', name: 'Nova Categoria', icon: '🍕' }
];
```

### Ajustar Preços
Modifique os arrays `sizes`, `borders` e `extras` em `ProductModal.tsx`.

## Responsividade

A aplicação é totalmente responsiva:
- **Mobile**: Layout em coluna única
- **Tablet**: Grid de 2 colunas
- **Desktop**: Grid de 3-4 colunas

## Temas

Suporte completo a modo claro/escuro:
- Cores adaptáveis
- Ícones consistentes
- Transições suaves

## Próximos Passos

1. **Integração com Backend**: Conectar com API real de pizzas
2. **Sistema de Favoritos**: Persistir favoritos no backend
3. **Geolocalização**: Calcular frete baseado na localização
4. **Tempo de Entrega**: Estimativa dinâmica
5. **Promoções**: Sistema de cupons e ofertas
6. **Notificações**: Push notifications para status do pedido

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação da API DotFlow
- Issues do repositório
- Equipe de desenvolvimento

