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
