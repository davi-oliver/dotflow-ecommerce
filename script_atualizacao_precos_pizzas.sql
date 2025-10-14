-- =====================================================
-- SCRIPT DE ATUALIZAÇÃO DE PREÇOS - GO PIZZA DELIVERY
-- Baseado no cardápio anexado e categorias da API DotFlow
-- =====================================================

-- =====================================================
-- PARTE 1: PIZZAS CLÁSSICAS (category_id: 8)
-- Preços base: P=32.90, M=40.90, G=49.90
-- =====================================================

-- Americana - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 21 AND name = 'Americana' AND category_id = 8;

-- Bacon - Pizza G (Grande) - 8 fatias  
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 22 AND name = 'Bacon' AND category_id = 8;

-- Brócolis com Bacon - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 23 AND name = 'Brócolis com Bacon' AND category_id = 8;

-- Calabresa - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 24 AND name = 'Calabresa' AND category_id = 8;

-- Calabresa Paulista - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 25 AND name = 'Calabresa Paulista' AND category_id = 8;

-- Frango com Catupiry - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 26 AND name = 'Frango com Catupiry' AND category_id = 8;

-- Frango com Cheddar - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 27 AND name = 'Frango com Cheddar' AND category_id = 8;

-- Marguerita - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 28 AND name = 'Marguerita' AND category_id = 8;

-- Milho - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 29 AND name = 'Milho' AND category_id = 8;

-- Mussarela - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 30 AND name = 'Mussarela' AND category_id = 8;

-- Pepperoni - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 31 AND name = 'Pepperoni' AND category_id = 8;

-- Portuguesa - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 32 AND name = 'Portuguesa' AND category_id = 8;

-- Presunto - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 33 AND name = 'Presunto' AND category_id = 8;

-- Quatro Queijos - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 34 AND name = 'Quatro Queijos' AND category_id = 8;

-- =====================================================
-- PARTE 2: PIZZAS ESPECIAIS (category_id: 9)
-- Preços base: P=36.90, M=45.90, G=54.90
-- =====================================================

-- Brócolis com Bacon e Catupiry - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 35 AND name = 'Brócolis com Bacon e Catupiry' AND category_id = 9;

-- Calabresa com Catupiry - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 36 AND name = 'Calabresa com Catupiry' AND category_id = 9;

-- Frango com Catupiry e Cheddar - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 37 AND name = 'Frango com Catupiry e Cheddar' AND category_id = 9;

-- Frango Especial - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 38 AND name = 'Frango Especial' AND category_id = 9;

-- Go Pizza Especial - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 39 AND name = 'Go Pizza Especial' AND category_id = 9;

-- Milho com Catupiry - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 40 AND name = 'Milho com Catupiry' AND category_id = 9;

-- Presunto com Catupiry - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '54.90', updated_at = NOW()
WHERE id = 41 AND name = 'Presunto com Catupiry' AND category_id = 9;

-- =====================================================
-- PARTE 3: PIZZAS DOCES (category_id: 10)
-- Preços base: P=32.90, M=40.90, G=49.90
-- =====================================================

-- Go Chocolate - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 42 AND name = 'Go Chocolate' AND category_id = 10;

-- Go Chocobis - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 43 AND name = 'Go Chocobis' AND category_id = 10;

-- Go Choconinho - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 44 AND name = 'Go Choconinho' AND category_id = 10;

-- Go Chocorango - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 45 AND name = 'Go Chocorango' AND category_id = 10;

-- Go Sensação - Pizza G (Grande) - 8 fatias
UPDATE products 
SET price = '49.90', updated_at = NOW()
WHERE id = 46 AND name = 'Go Sensação' AND category_id = 10;
