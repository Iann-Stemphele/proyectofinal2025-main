-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-08-2025 a las 07:10:20
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `lasdosreinas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id_Empleado` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `cargo` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contiene`
--

CREATE TABLE `contiene` (
  `id_contiene` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingresa`
--

CREATE TABLE `ingresa` (
  `id_Empleado` int(11) NOT NULL,
  `id_Producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `nombre_cliente` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_Producto` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock_disponible` int(11) DEFAULT NULL,
  `categoria` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_Producto`, `nombre`, `descripcion`, `precio`, `stock_disponible`, `categoria`) VALUES
(1, 'CAFÉ AMERICANO', '', 145.00, 100, 'desayuno-merienda'),
(2, 'CAFÉ BAILEYS', 'café doble + baileys + crema', 190.00, 100, 'desayuno-merienda'),
(3, 'CAFÉ CON LECHE', '', 150.00, 100, 'desayuno-merienda'),
(4, 'CAFÉ FRIO', '', 190.00, 100, 'desayuno-merienda'),
(5, 'CAFÉ IRLANDÉS', 'café + whisky + crema', 290.00, 100, 'desayuno-merienda'),
(6, 'CAFÉ CAPUCCINO', '', 160.00, 100, 'desayuno-merienda'),
(7, 'CHOCOLATE FRIO O CALIENTE', '', 180.00, 100, 'desayuno-merienda'),
(8, 'CAFÉ CORTADO', '', 150.00, 100, 'desayuno-merienda'),
(9, 'CAFÉ EXPRESSO', '', 140.00, 100, 'desayuno-merienda'),
(10, 'CAFÉ EXPRESSO DOBLE', '', 150.00, 100, 'desayuno-merienda'),
(11, 'CAFÉ LAGRIMA', '', 140.00, 100, 'desayuno-merienda'),
(12, 'CAFÉ LATTE', '', 190.00, 100, 'desayuno-merienda'),
(13, 'SUBMARINO', '', 190.00, 100, 'desayuno-merienda'),
(14, 'TÉ TWININGS', '', 90.00, 100, 'desayuno-merienda'),
(15, 'TÉ CON LECHE', '', 130.00, 100, 'desayuno-merienda'),
(16, 'TÉ FRIO', 'leche deslactosada o vegetal', 130.00, 100, 'desayuno-merienda'),
(17, 'MEDIALUNA DE JAMON Y QUESO', '', 130.00, 100, 'desayuno-merienda'),
(18, 'PAN DE QUESO (CHIPA) X3', '', 60.00, 100, 'desayuno-merienda'),
(19, 'SCONS DE QUESO X1', '', 25.00, 100, 'desayuno-merienda'),
(20, 'SCOND DE QUESO X2', '', 45.00, 100, 'desayuno-merienda'),
(21, '2 TOSTADAS CON MANTECA O MERMELADA', '', 90.00, 100, 'desayuno-merienda'),
(22, 'TOSTADO DE JAMON Y QUESO', '', 290.00, 100, 'desayuno-merienda'),
(23, 'ALFAJOR CASERO DE MAICENA CHICO', '', 40.00, 100, 'desayuno-merienda'),
(24, 'ALFAJOR CASERO DE MAICENA GRANDE', '', 60.00, 100, 'desayuno-merienda'),
(25, 'ALFAJOR CASERO MAICENA (VARIEDAD)', '', 60.00, 100, 'desayuno-merienda'),
(26, 'BROWNIE', '', 150.00, 100, 'desayuno-merienda'),
(27, 'BUDIN', '', 150.00, 100, 'desayuno-merienda'),
(28, 'CARROT CAKE', '', 150.00, 100, 'desayuno-merienda'),
(29, 'COOKIES CHIPS CHOCO', '', 30.00, 100, 'desayuno-merienda'),
(30, 'COOKIES VAINILLA', '', 25.00, 100, 'desayuno-merienda'),
(31, 'MEDIALUNAS DULCES CHICAS', '', 50.00, 100, 'desayuno-merienda'),
(32, 'PASTA FROLA', '', 150.00, 100, 'desayuno-merienda'),
(33, 'PASTEL FRITO', '', 60.00, 100, 'desayuno-merienda'),
(34, 'ALFAJORCITO DE MAICENA X2', '', 80.00, 100, 'desayuno-merienda'),
(35, 'ALFAJOR DECORADO', '', 90.00, 100, 'desayuno-merienda'),
(36, 'ALFAJOR SALCHICHON', '', 50.00, 100, 'desayuno-merienda'),
(37, 'COOKIES X2', '', 80.00, 100, 'desayuno-merienda'),
(38, 'PANCHITO/PALMERITA X2', '', 80.00, 100, 'desayuno-merienda'),
(39, 'BROWNIE', '', 210.00, 100, 'desayuno-merienda'),
(40, 'CHIPA X 3', '', 170.00, 100, 'desayuno-merienda'),
(41, 'EMPANADA X 2', '', 160.00, 100, 'desayuno-merienda'),
(42, 'MASITAS DECORADAS X3', '', 50.00, 100, 'desayuno-merienda'),
(43, 'MUFFIN', '', 55.00, 100, 'desayuno-merienda'),
(44, 'PASTAFROLA MEMBRILLO', '', 180.00, 100, 'desayuno-merienda'),
(45, 'PASTAFROLA DULCE DE LECHE', '', 210.00, 100, 'desayuno-merienda'),
(46, 'PIZZA CON MOZZARELLA (2p)', '', 425.00, 100, 'desayuno-merienda'),
(47, 'TOSTADO DE JAMON Y QUESO', '', 220.00, 100, 'desayuno-merienda'),
(48, 'TARTA J&Q', '', 350.00, 100, 'desayuno-merienda'),
(49, 'ESPECIAL 1', '1 té, café o exprimido de naranja; 1 tostado de jamón y queso o 2 medialunas de manteca; Porción dulce (opción del día)', 350.00, 100, 'desayuno-merienda'),
(50, 'ESPECIAL 2', '2 Té, café o exprimido de naranja; 2 tostado de jamón y queso o 4 medialunas de manteca; 2 Porciones dulces (opción del día)', 590.00, 100, 'desayuno-merienda'),
(51, 'MILANESA COMÚN', 'Milanesa de ternera con papas fritas; mayonesa ketchup o mostaza', 450.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(52, 'MILANESA ESPECIAL', 'Milanesa de ternera; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 590.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(53, 'MILANESA NAPOLITANA DE TERNERA', 'Napolitana; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 480.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(54, 'MILANESA NAPOLITANA DE POLLO', 'Napolitana; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 480.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(55, 'HAMBURGUESA COMÚN', 'Hamburguesa de ternera con papas fritas; mayonesa, ketchup o mostaza', 320.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(56, 'HAMBURGUESA ESPECIAL', 'Hamburguesa de ternera; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 420.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(57, 'HAMBURGUESA VEGETARIANA COMÚN', 'Hamburguesa vegetariana con papas fritas; mayonesa, ketchup o mostaza', 450.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(58, 'HAMBURGUESA VEGETARIANA ESPECIAL', 'Hamburguesa vegetariana; queso; huevo frito; papas fritas; mayonesa, ketchup o mostaza', 550.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(59, 'CHIVITO PARA 1', 'churrasco de ternera con jamón; muzarella; panceta; huevo frito; tomate; lechuga; papas fritas; mayonesa, ketchup o mostaza', 520.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(60, 'CHIVITO PARA 2', '2 churrascos de ternera con jamón; muzarella; panceta; huevos fritos; tomate; lechuga; papas fritas; mayonesa, ketchup o mostaza', 890.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(61, 'CHORIZO AL PAN', 'Chorizo, tomate, lechuga, mayonesa, ketchup o mostaza', 220.00, 100, 'milanesas-hamburgesas-chivitos-chorizo'),
(62, 'PAPAS BRAVAS', '', 320.00, 100, 'guarniciones-ensaladas'),
(63, 'PAPAS FRITAS', '', 260.00, 100, 'guarniciones-ensaladas'),
(64, 'PAPAS FRITAS C/2 HUEVOS FRITOS', '', 310.00, 100, 'guarniciones-ensaladas'),
(65, 'PAPAS FRITAS CON CHEDDAR', '', 320.00, 100, 'guarniciones-ensaladas'),
(66, 'PAPAS NOISETTES', '', 320.00, 100, 'guarniciones-ensaladas'),
(67, 'PAPAS RÚSTICAS', '', 280.00, 100, 'guarniciones-ensaladas'),
(68, 'PURÉ DE PAPAS', '', 250.00, 100, 'guarniciones-ensaladas'),
(69, 'ENSALADA CÉSAR', '', 350.00, 100, 'guarniciones-ensaladas'),
(70, 'ENSALADA MIXTA', 'lechuga, tomate y cebolla', 270.00, 100, 'guarniciones-ensaladas'),
(71, 'CHURRASCO A LA PLANCHA', 'TERNERA O POLLO', 230.00, 100, 'guarniciones-ensaladas'),
(72, 'NUGGETS DE POLLO', '', 170.00, 100, 'guarniciones-ensaladas'),
(73, 'OMELETTE', '', 260.00, 100, 'guarniciones-ensaladas'),
(74, 'OMELETTE JAMÓN Y QUESO', '', 260.00, 100, 'guarniciones-ensaladas'),
(75, 'MILANESA DE TERNERA O POLLO', '', 260.00, 100, 'guarniciones-ensaladas'),
(76, 'REVUELTO GRAMAJO', 'Papa, huevo, jamón, panceta, cebolla y queso', 490.00, 100, 'guarniciones-ensaladas'),
(77, 'EMPANADAS', '', 75.00, 100, 'guarniciones-ensaladas'),
(78, 'CROQUETAS DE PAPA', '', 190.00, 100, 'guarniciones-ensaladas'),
(79, 'CROQUETAS DE ARROZ', '', 190.00, 100, 'guarniciones-ensaladas'),
(80, 'PORCIÓN DE TARTA', 'carne dulce; carne salada; cebolla y panceta; chivito; jamón y queso; pascualina; pollo; zapallito', 149.00, 100, 'guarniciones-ensaladas'),
(81, 'TALLARINES CON SALSA', '', 320.00, 100, 'guarniciones-ensaladas'),
(82, 'RAVIOLES CON SALSA', '', 260.00, 100, 'guarniciones-ensaladas'),
(83, 'ÑOQUIS CON SALSA', '', 310.00, 100, 'guarniciones-ensaladas'),
(84, 'SALSAS', '4 quesos, caruso, tuco de carne', 190.00, 100, 'guarniciones-ensaladas'),
(85, '2 REINAS', 'tequila, jugo de naranja, granadina', 290.00, 100, 'tragos'),
(86, 'AMARGA CON VERMOUTH', '', 210.00, 100, 'tragos'),
(87, 'APEROL SPRITZ', 'aperol, espumante, soda, naranja', 290.00, 100, 'tragos'),
(88, 'BAILEYS', '', 190.00, 100, 'tragos'),
(89, 'CAIPIRIÑA LIMA', 'cachaza, azúcar', 290.00, 100, 'tragos'),
(90, 'CAIPIROSCA LIMA', 'vodka, azúcar', 290.00, 100, 'tragos'),
(91, 'CAMPARI CON NARANJA', '', 290.00, 100, 'tragos'),
(92, 'CUBA LIBRE', 'coca cola y ron', 290.00, 100, 'tragos'),
(93, 'DAIKIRI', 'ron blanco, frutilla o durazno', 290.00, 100, 'tragos'),
(94, 'FERNET CON COCA COLA', 'fernet', 180.00, 100, 'tragos'),
(95, 'GIN TONIC', 'gin, tónica, limón', 290.00, 100, 'tragos'),
(96, 'JAGER', 'jager, energizante o coca cola', 290.00, 100, 'tragos'),
(97, 'MARGARITA', 'tequila, licor, jugo de limón, triple sec', 290.00, 100, 'tragos'),
(98, 'MALIBÚ COCA COLA', 'malibú', 290.00, 100, 'tragos'),
(99, 'MALIBÚ POMELO O NARANJA', 'malibú', 290.00, 100, 'tragos'),
(100, 'MOJITO', 'menta, ron, lima, azúcar', 290.00, 100, 'tragos'),
(101, 'NEGRONI', 'gin, campari, vermouth rosso', 290.00, 100, 'tragos'),
(102, 'PIÑA COLADA', 'malibú, ron, ananá, crema', 290.00, 100, 'tragos'),
(103, 'VERMOUTH', '', 150.00, 100, 'tragos'),
(104, 'WHISCOLA IMPORTADO', '', 290.00, 100, 'tragos'),
(105, 'WHISCOLA NACIONAL', '', 290.00, 100, 'tragos'),
(106, 'WHISKY JHONIE WALKER ETIQUETA NEGRA', '', 280.00, 100, 'tragos'),
(107, 'WHISKY JHONIE WALKER ETIQUETA ROJA', '', 210.00, 100, 'tragos'),
(108, 'WHISKY NACIONAL DUNBAR GREGSONS', '', 170.00, 100, 'tragos'),
(109, 'WHISKY SANDY MACEY RESTO', '', 210.00, 100, 'tragos'),
(110, 'GRAPPA', '', 70.00, 100, 'tragos'),
(111, 'GRAPPAMIEL', '', 90.00, 100, 'tragos'),
(112, 'COMBO REINA 1', 'Hamburguesa de ternera; papas fritas; mayonesa, ketchup o mostaza; gaseosa 500ml o 600ml', 490.00, 100, 'combos-especiales'),
(113, 'COMBO REINA 2', 'Hamburguesa de ternera; queso; huevo frito; panceta; jamón; papas fritas; aderezos y gaseosa de 1lt', 990.00, 100, 'combos-especiales'),
(114, 'PICADA 2 REINAS PARA 2', 'Aceitunas, bondiola, jamón, mani, papas chips, quesos, salame, pan', 590.00, 100, 'combos-especiales'),
(115, 'PICADA 2 REINAS PARA 4', 'Aceitunas, bastoners de queso, bondiola, lomito, mani, mortadela, palichips, pan, papas chips, queso, salame, tostaditas', 1490.00, 100, 'combos-especiales'),
(116, 'ALFAJOR RED VELVET X1', '', 150.00, 100, 'postres'),
(117, 'ALFAJOR SALCHICHON X1', '', 110.00, 100, 'postres'),
(118, 'CHEESCAKE', '', 210.00, 100, 'postres'),
(119, 'CHOCO MAS', '', 210.00, 100, 'postres'),
(120, 'CLASICO DE DURAZNO', '', 210.00, 100, 'postres'),
(121, 'DE ANTOLOGIA', '', 210.00, 100, 'postres'),
(122, 'LEMON PIE', '', 210.00, 100, 'postres'),
(123, 'MANZANA SUTIL', '', 210.00, 100, 'postres'),
(124, 'MIL HOJAS (ROGEL)', '', 210.00, 100, 'postres'),
(125, 'RAMONA', '', 210.00, 100, 'postres'),
(126, 'RULO LOCO', '', 210.00, 100, 'postres'),
(127, 'SALCHICHON CHOCOLATE', '', 110.00, 100, 'postres'),
(128, 'TORTA SALCHICHON', '', 210.00, 100, 'postres'),
(129, 'TRES X TRES', '', 210.00, 100, 'postres'),
(130, 'VOLCAN CHOCOLATE X1', '', 160.00, 100, 'postres'),
(131, 'VOLCAN DULCE DE LECHE X1', '', 160.00, 100, 'postres'),
(132, 'CHAJA CLÁSICO DE DURAZNO', '', 230.00, 100, 'postres'),
(133, 'CHAJA SIN FRUTA', '', 230.00, 100, 'postres'),
(134, 'FLAN', '', 190.00, 100, 'postres'),
(135, 'FLAN CON DULCE DE LECHE', '', 210.00, 100, 'postres'),
(136, 'MILHOJAS PORCIÓN', '', 210.00, 100, 'postres'),
(137, 'LEMON PIE PORCIÓN', '', 210.00, 100, 'postres'),
(138, '1 BOCHAS DE HELADO', '', 130.00, 100, 'postres'),
(139, '2 BOCHAS DE HELADO', '', 160.00, 100, 'postres'),
(140, '3 BOCHAS DE HELADO', '', 190.00, 100, 'postres'),
(141, 'BROWNIE CON HELADO', '', 250.00, 100, 'postres'),
(142, 'MILHOJAS INDIVIDUAL', '', 260.00, 100, 'postres'),
(143, 'LEMON PIE INDIVIDUAL', '', 270.00, 100, 'postres'),
(144, 'BROWNIE INDIVIDUAL', '', 210.00, 100, 'postres'),
(145, 'ACEITUNAS', '', 420.00, 100, 'pizzas'),
(146, 'ANANÁ', '', 490.00, 100, 'pizzas'),
(147, 'ANANÁ Y JAMÓN', '', 490.00, 100, 'pizzas'),
(148, 'CALABRESA', '', 420.00, 100, 'pizzas'),
(149, 'CHOCLO Y JAMÓN', '', 490.00, 100, 'pizzas'),
(150, 'CUATRO QUESOS', '', 490.00, 100, 'pizzas'),
(151, 'HUEVO DURO', '', 420.00, 100, 'pizzas'),
(152, 'JAMÓN', '', 420.00, 100, 'pizzas'),
(153, 'LOMITO', '', 490.00, 100, 'pizzas'),
(154, 'MOZZARELLA', '', 390.00, 100, 'pizzas'),
(155, 'NAPOLITANA', '(tomate, orégano, mozzarella)', 490.00, 100, 'pizzas'),
(156, 'PALMITOS Y GOLF', '', 490.00, 100, 'pizzas'),
(157, 'PANCETA', '', 420.00, 100, 'pizzas'),
(158, 'PIZZA CON MOZZARELLA SIN GLUTEN', '', 425.00, 100, 'pizzas'),
(159, 'HAMBURGUESA CASERA AL PAN CON QUESO', '+ FRITAS + JUGO', 490.00, 100, 'menu-infantil'),
(160, '4 NUGGUETS', '+ FRITAS + JUGO', 450.00, 100, 'menu-infantil'),
(161, 'MILANESA TERNERA O POLLO AL PAN', '+ FRITAS + JUGO', 490.00, 100, 'menu-infantil'),
(162, 'PANCHO AL PAN', '+ FRITAS + JUGO', 350.00, 100, 'menu-infantil'),
(163, 'TALLARINES CON FILLETTO', '', 350.00, 100, 'menu-infantil'),
(164, 'PAN DE HAMBURGUESA O MILANESA SIN GLUTEN', '', 55.00, 100, 'menu-infantil'),
(165, 'AGUA SABORIZADA VITALE 1lt', '', 149.00, 100, 'bebidas'),
(166, 'AGUA SABORIZADA VITALE 625ml', '', 69.00, 100, 'bebidas'),
(167, 'AGUA SIN/CON GAS 500ml', '', 60.00, 100, 'bebidas'),
(168, 'CEPITA 995ml', '', 89.00, 100, 'bebidas'),
(169, 'JUGO DE NARANJA', '', 100.00, 100, 'bebidas'),
(170, 'JUGO DE NARANJA/ZANAHORIA', '', 110.00, 100, 'bebidas'),
(171, 'JUGO EXPRIMIDO DE NARANJA (VASO)', '', 160.00, 100, 'bebidas'),
(172, 'JUGUITO 200ml', '', 25.00, 100, 'bebidas'),
(173, 'JUGO ADES 200ml', '', 40.00, 100, 'bebidas'),
(174, 'LIMONADA 2 REINAS MENTA Y JENGIBRE', '', 220.00, 100, 'bebidas'),
(175, 'LINEA COCA COLA 1lt', '', 150.00, 100, 'bebidas'),
(176, 'LINEA COCA COLA 600ml', '', 95.00, 100, 'bebidas'),
(177, 'SMOOTHIES', '', 250.00, 100, 'bebidas'),
(178, 'MONSTER ENERGY', '', 130.00, 100, 'bebidas'),
(179, 'CORONA 330ml 0% ALCOHOL', '', 149.00, 100, 'bebidas'),
(180, 'CORONA 710ml', '', 230.00, 100, 'bebidas'),
(181, 'PATAGONIA 730ml', '', 260.00, 100, 'bebidas'),
(182, 'PATAGONIA IPA 24.7 730ml', '', 260.00, 100, 'bebidas'),
(183, 'PATRICIA LAGER 340ml', '', 95.00, 100, 'bebidas'),
(184, 'PATRICIA LAGER 960ml', '', 240.00, 100, 'bebidas'),
(185, 'PILSEN 960ml', '', 190.00, 100, 'bebidas'),
(186, 'PILSEN 340ml', '', 90.00, 100, 'bebidas'),
(187, 'PILSEN 960ml 0% ALCOHOL', '', 190.00, 100, 'bebidas'),
(188, 'STELLA ARTOIS 330ml', '(con o sin alcohol)', 190.00, 100, 'bebidas'),
(189, 'STELLA ARTOIS 975ml', '', 350.00, 100, 'bebidas'),
(190, 'SMIRNOFF ICE 275ml', '', 140.00, 100, 'bebidas'),
(191, 'VINO DE LA CASA (tinto)', '', 230.00, 100, 'bebidas'),
(192, 'VINO NOVECENTO MALBEC', '', 280.00, 100, 'bebidas'),
(193, 'VINO DON PASCUAL BRUT 750 ML', '', 390.00, 100, 'bebidas'),
(194, 'VINO DON PASCUAL COASTAL 750 ML', '', 590.00, 100, 'bebidas'),
(195, 'VINO DON PASCUAL RESERVA 750ML', '', 650.00, 100, 'bebidas');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id_Empleado`);

--
-- Indices de la tabla `contiene`
--
ALTER TABLE `contiene`
  ADD PRIMARY KEY (`id_contiene`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `ingresa`
--
ALTER TABLE `ingresa`
  ADD PRIMARY KEY (`id_Empleado`,`id_Producto`),
  ADD KEY `id_Producto` (`id_Producto`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_Producto`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `contiene`
--
ALTER TABLE `contiene`
  MODIFY `id_contiene` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `contiene`
--
ALTER TABLE `contiene`
  ADD CONSTRAINT `contiene_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `contiene_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_Producto`);

--
-- Filtros para la tabla `ingresa`
--
ALTER TABLE `ingresa`
  ADD CONSTRAINT `ingresa_ibfk_1` FOREIGN KEY (`id_Empleado`) REFERENCES `administrador` (`id_Empleado`),
  ADD CONSTRAINT `ingresa_ibfk_2` FOREIGN KEY (`id_Producto`) REFERENCES `producto` (`id_Producto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
