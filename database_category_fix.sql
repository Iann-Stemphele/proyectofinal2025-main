-- Las Dos Reinas - Category System Implementation
-- This script adds a categoria column and maps all 195 products to their appropriate categories

-- Step 1: Add categoria column to Producto table
ALTER TABLE `Producto` ADD COLUMN `categoria` VARCHAR(50) NOT NULL DEFAULT '';

-- Step 2: Update products with their appropriate categories
-- Based on analysis of product names and frontend menu structure

-- DESAYUNO Y MERIENDA (IDs: 1-33, 34-48)
UPDATE `Producto` SET `categoria` = 'desayuno-merienda' WHERE `id_Producto` IN (
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,
    34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50
);

-- MILANESAS, HAMBURGUESAS, CHIVITOS, CHORIZO (IDs: 51-61)
UPDATE `Producto` SET `categoria` = 'milanesas-hamburgesas-chivitos-chorizo' WHERE `id_Producto` IN (
    51,52,53,54,55,56,57,58,59,60,61
);

-- GUARNICIONES Y ENSALADAS (IDs: 62-84)
UPDATE `Producto` SET `categoria` = 'guarniciones-ensaladas' WHERE `id_Producto` IN (
    62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84
);

-- TRAGOS (IDs: 85-111)
UPDATE `Producto` SET `categoria` = 'tragos' WHERE `id_Producto` IN (
    85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111
);

-- COMBOS Y ESPECIALES (IDs: 112-115)
UPDATE `Producto` SET `categoria` = 'combos-especiales' WHERE `id_Producto` IN (
    112,113,114,115
);

-- POSTRES (IDs: 116-144)
UPDATE `Producto` SET `categoria` = 'postres' WHERE `id_Producto` IN (
    116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144
);

-- PIZZAS (IDs: 145-158)
UPDATE `Producto` SET `categoria` = 'pizzas' WHERE `id_Producto` IN (
    145,146,147,148,149,150,151,152,153,154,155,156,157,158
);

-- MENU INFANTIL (IDs: 159-164)
UPDATE `Producto` SET `categoria` = 'menu-infantil' WHERE `id_Producto` IN (
    159,160,161,162,163,164
);

-- BEBIDAS (IDs: 165-195)
UPDATE `Producto` SET `categoria` = 'bebidas' WHERE `id_Producto` IN (
    165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195
);

-- Step 3: Verify the categorization
SELECT categoria, COUNT(*) as total_productos 
FROM Producto 
GROUP BY categoria 
ORDER BY categoria;

-- Step 4: Show sample products from each category
SELECT categoria, id_Producto, nombre, precio 
FROM Producto 
WHERE id_Producto IN (1, 51, 62, 85, 112, 116, 145, 159, 165)
ORDER BY categoria, id_Producto;