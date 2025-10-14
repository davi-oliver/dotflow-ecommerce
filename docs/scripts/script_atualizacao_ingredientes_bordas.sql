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
