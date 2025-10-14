-- =====================================================
-- SCRIPT COMPLETO DE ATUALIZAÇÃO DE PREÇOS
-- GO PIZZA DELIVERY - Baseado no cardápio anexado
-- =====================================================
-- 
-- IMPORTANTE: Execute este script em partes para evitar erros
-- Recomendação: Execute uma categoria por vez
--
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

-- =====================================================
-- PARTE 4: INGREDIENTES EXTRAS (category_id: 11)
-- Preços conforme cardápio "ADICIONAIS"
-- =====================================================

-- Catupiry
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 47 AND name = 'Catupiry' AND category_id = 11;

-- Bacon
UPDATE products 
SET price = '5.90', updated_at = NOW()
WHERE id = 48 AND name = 'Bacon' AND category_id = 11;

-- Mussarela
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 49 AND name = 'Mussarela' AND category_id = 11;

-- Tomatinho (Cherry Tomato)
UPDATE products 
SET price = '5.90', updated_at = NOW()
WHERE id = 50 AND name = 'Tomatinho' AND category_id = 11;

-- Cheddar
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 51 AND name = 'Cheddar' AND category_id = 11;

-- Pepperoni
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 52 AND name = 'Pepperoni' AND category_id = 11;

-- Ovo
UPDATE products 
SET price = '2.90', updated_at = NOW()
WHERE id = 53 AND name = 'Ovo' AND category_id = 11;

-- Calabresa
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 54 AND name = 'Calabresa' AND category_id = 11;

-- Frango
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 55 AND name = 'Frango' AND category_id = 11;

-- Cebola
UPDATE products 
SET price = '2.90', updated_at = NOW()
WHERE id = 56 AND name = 'Cebola' AND category_id = 11;

-- Brócolis
UPDATE products 
SET price = '7.90', updated_at = NOW()
WHERE id = 57 AND name = 'Brócolis' AND category_id = 11;

-- Presunto
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 58 AND name = 'Presunto' AND category_id = 11;

-- Milho e Ervilha
UPDATE products 
SET price = '2.90', updated_at = NOW()
WHERE id = 59 AND name = 'Milho e Ervilha' AND category_id = 11;

-- Molho Extra
UPDATE products 
SET price = '1.90', updated_at = NOW()
WHERE id = 60 AND name = 'Molho Extra' AND category_id = 11;

-- Parmesão
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 61 AND name = 'Parmesão' AND category_id = 11;

-- Provolone
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 62 AND name = 'Provolone' AND category_id = 11;

-- Alho Frito
UPDATE products 
SET price = '3.90', updated_at = NOW()
WHERE id = 63 AND name = 'Alho Frito' AND category_id = 11;

-- Chocolate
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 64 AND name = 'Chocolate' AND category_id = 11;

-- Morango
UPDATE products 
SET price = '7.90', updated_at = NOW()
WHERE id = 65 AND name = 'Morango' AND category_id = 11;

-- Biss
UPDATE products 
SET price = '4.99', updated_at = NOW()
WHERE id = 66 AND name = 'Biss' AND category_id = 11;

-- Leite em pó
UPDATE products 
SET price = '4.90', updated_at = NOW()
WHERE id = 67 AND name = 'Leite em pó' AND category_id = 11;

-- Leite condensado
UPDATE products 
SET price = '4.90', updated_at = NOW()
WHERE id = 68 AND name = 'Leite condensado' AND category_id = 11;

-- =====================================================
-- PARTE 5: BORDAS CLÁSSICAS (category_id: 12)
-- Preços conforme cardápio "BORDAS CLÁSSICAS"
-- =====================================================

-- Borda de Catupiry
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 69 AND name = 'Borda de Catupiry' AND category_id = 12;

-- Borda de Cheddar
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 70 AND name = 'Borda de Cheddar' AND category_id = 12;

-- Borda de Chocolate
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 71 AND name = 'Borda de Chocolate' AND category_id = 12;

-- Borda de Mussarela
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 72 AND name = 'Borda de Mussarela' AND category_id = 12;

-- =====================================================
-- PARTE 6: BORDAS ESPECIAIS (category_id: 13)
-- Preços conforme cardápio "BORDAS ESPECIAIS"
-- =====================================================

-- Borda de Catucheddar
UPDATE products 
SET price = '11.90', updated_at = NOW()
WHERE id = 73 AND name = 'Borda de Catucheddar' AND category_id = 13;

-- Borda de Frango com Queijo
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 74 AND name = 'Borda de Frango com Queijo' AND category_id = 13;

-- Borda de Presunto e Queijo
UPDATE products 
SET price = '16.90', updated_at = NOW()
WHERE id = 75 AND name = 'Borda de Presunto e Queijo' AND category_id = 13;

-- Borda de Calabresa com Queijo
UPDATE products 
SET price = '19.90', updated_at = NOW()
WHERE id = 76 AND name = 'Borda de Calabresa com Queijo' AND category_id = 13;

-- Borda de Catupiry com Bacon
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 77 AND name = 'Borda de Catupiry com Bacon' AND category_id = 13;

-- =====================================================
-- PARTE 7: COMBOS (category_id: 14)
-- Preços conforme cardápio "COMBOS"
-- =====================================================

-- Combo 1: 1 Pizza Grande + Broto Doce + Mantiqueira 2L
UPDATE products 
SET price = '74.90', updated_at = NOW()
WHERE id = 78 AND name = '1 Pizza Grande + Broto Doce + Mantiqueira 2L' AND category_id = 14;

-- Combo 2: 2 Pizzas Grandes Clássicas ou Doces + Mantiqueira 2L
UPDATE products 
SET price = '99.90', updated_at = NOW()
WHERE id = 79 AND name = '2 Pizzas Grandes Clássicas ou Doces + Mantiqueira 2L' AND category_id = 14;

-- Combo 3: 3 Pizzas Grandes Clássicas ou Doces + Mantiqueira 2L
UPDATE products 
SET price = '149.90', updated_at = NOW()
WHERE id = 80 AND name = '3 Pizzas Grandes Clássicas ou Doces + Mantiqueira 2L' AND category_id = 14;

-- Combo 4: 4 Pizzas Grandes Clássicas ou Doces + 2 Mantiqueira 2L
UPDATE products 
SET price = '204.90', updated_at = NOW()
WHERE id = 81 AND name = '4 Pizzas Grandes Clássicas ou Doces + 2 Mantiqueira 2L' AND category_id = 14;

-- Combo 5: 1 Broto Clássico ou Doce + 2 Refrigerantes 200ml
UPDATE products 
SET price = '35.90', updated_at = NOW()
WHERE id = 82 AND name = '1 Broto Clássico ou Doce + 2 Refrigerantes 200ml' AND category_id = 14;

-- =====================================================
-- PARTE 8: BEBIDAS (category_id: 15)
-- Preços conforme cardápio "BEBIDAS"
-- =====================================================

-- Refrigerante 200ml
UPDATE products 
SET price = '3.50', updated_at = NOW()
WHERE id = 83 AND name = 'Refrigerante' AND category_id = 15;

-- Coca-Cola 2 Litros
UPDATE products 
SET price = '14.90', updated_at = NOW()
WHERE id = 84 AND name = 'Coca-Cola' AND category_id = 15;

-- Mantiqueira 2 Litros
UPDATE products 
SET price = '9.90', updated_at = NOW()
WHERE id = 85 AND name = 'Mantiqueira' AND category_id = 15;

-- =====================================================
-- VERIFICAÇÃO DOS PREÇOS ATUALIZADOS
-- =====================================================

-- Consulta para verificar os preços das pizzas clássicas
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 8 
ORDER BY name;

-- Consulta para verificar os preços das pizzas especiais
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 9 
ORDER BY name;

-- Consulta para verificar os preços das pizzas doces
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 10 
ORDER BY name;

-- Consulta para verificar os preços dos ingredientes
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 11 
ORDER BY name;

-- Consulta para verificar os preços das bordas
SELECT id, name, price, category_id 
FROM products 
WHERE category_id IN (12, 13) 
ORDER BY category_id, name;

-- Consulta para verificar os preços dos combos
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 14 
ORDER BY name;

-- Consulta para verificar os preços das bebidas
SELECT id, name, price, category_id 
FROM products 
WHERE category_id = 15 
ORDER BY name;
