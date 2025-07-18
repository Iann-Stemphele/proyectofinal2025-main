-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 15-07-2025 a las 18:22:59
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `LasDosReinas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Administrador`
--

CREATE TABLE `Administrador` (
  `id_Empleado` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `cargo` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Contiene`
--

CREATE TABLE `Contiene` (
  `id_contiene` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Ingresa`
--

CREATE TABLE `Ingresa` (
  `id_Empleado` int(11) NOT NULL,
  `id_Producto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Pedido`
--

CREATE TABLE `Pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `nombre_cliente` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Producto`
--

CREATE TABLE `Producto` (
  `id_Producto` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock_disponible` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Producto`
--

INSERT INTO `Producto` (`id_Producto`, `nombre`, `descripcion`, `precio`, `stock_disponible`) VALUES
(1, 'CAFÉ AMERICANO', '', 145.00, 100),
(2, 'CAFÉ BAILEYS', 'café doble + baileys + crema', 190.00, 100),
(3, 'CAFÉ CON LECHE', '', 150.00, 100),
(4, 'CAFÉ FRIO', '', 190.00, 100),
(5, 'CAFÉ IRLANDÉS', 'café + whisky + crema', 290.00, 100),
(6, 'CAFÉ CAPUCCINO', '', 160.00, 100),
(7, 'CHOCOLATE FRIO O CALIENTE', '', 180.00, 100),
(8, 'CAFÉ CORTADO', '', 150.00, 100),
(9, 'CAFÉ EXPRESSO', '', 140.00, 100),
(10, 'CAFÉ EXPRESSO DOBLE', '', 150.00, 100),
(11, 'CAFÉ LAGRIMA', '', 140.00, 100),
(12, 'CAFÉ LATTE', '', 190.00, 100),
(13, 'SUBMARINO', '', 190.00, 100),
(14, 'TÉ TWININGS', '', 90.00, 100),
(15, 'TÉ CON LECHE', '', 130.00, 100),
(16, 'TÉ FRIO', 'leche deslactosada o vegetal', 130.00, 100),
(17, 'MEDIALUNA DE JAMON Y QUESO', '', 130.00, 100),
(18, 'PAN DE QUESO (CHIPA) X3', '', 60.00, 100),
(19, 'SCONS DE QUESO X1', '', 25.00, 100),
(20, 'SCOND DE QUESO X2', '', 45.00, 100),
(21, '2 TOSTADAS CON MANTECA O MERMELADA', '', 90.00, 100),
(22, 'TOSTADO DE JAMON Y QUESO', '', 290.00, 100),
(23, 'ALFAJOR CASERO DE MAICENA CHICO', '', 40.00, 100),
(24, 'ALFAJOR CASERO DE MAICENA GRANDE', '', 60.00, 100),
(25, 'ALFAJOR CASERO MAICENA (VARIEDAD)', '', 60.00, 100),
(26, 'BROWNIE', '', 150.00, 100),
(27, 'BUDIN', '', 150.00, 100),
(28, 'CARROT CAKE', '', 150.00, 100),
(29, 'COOKIES CHIPS CHOCO', '', 30.00, 100),
(30, 'COOKIES VAINILLA', '', 25.00, 100),
(31, 'MEDIALUNAS DULCES CHICAS', '', 50.00, 100),
(32, 'PASTA FROLA', '', 150.00, 100),
(33, 'PASTEL FRITO', '', 60.00, 100),
(34, 'ALFAJORCITO DE MAICENA X2', '', 80.00, 100),
(35, 'ALFAJOR DECORADO', '', 90.00, 100),
(36, 'ALFAJOR SALCHICHON', '', 50.00, 100),
(37, 'COOKIES X2', '', 80.00, 100),
(38, 'PANCHITO/PALMERITA X2', '', 80.00, 100),
(39, 'BROWNIE', '', 210.00, 100),
(40, 'CHIPA X 3', '', 170.00, 100),
(41, 'EMPANADA X 2', '', 160.00, 100),
(42, 'MASITAS DECORADAS X3', '', 50.00, 100),
(43, 'MUFFIN', '', 55.00, 100),
(44, 'PASTAFROLA MEMBRILLO', '', 180.00, 100),
(45, 'PASTAFROLA DULCE DE LECHE', '', 210.00, 100),
(46, 'PIZZA CON MOZZARELLA (2p)', '', 425.00, 100),
(47, 'TOSTADO DE JAMON Y QUESO', '', 220.00, 100),
(48, 'TARTA J&Q', '', 350.00, 100),
(49, 'ESPECIAL 1', '1 té, café o exprimido de naranja; 1 tostado de jamón y queso o 2 medialunas de manteca; Porción dulce (opción del día)', 350.00, 100),
(50, 'ESPECIAL 2', '2 Té, café o exprimido de naranja; 2 tostado de jamón y queso o 4 medialunas de manteca; 2 Porciones dulces (opción del día)', 590.00, 100),
(51, 'MILANESA COMÚN', 'Milanesa de ternera con papas fritas; mayonesa ketchup o mostaza', 450.00, 100),
(52, 'MILANESA ESPECIAL', 'Milanesa de ternera; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 590.00, 100),
(53, 'MILANESA NAPOLITANA DE TERNERA', 'Napolitana; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 480.00, 100),
(54, 'MILANESA NAPOLITANA DE POLLO', 'Napolitana; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 480.00, 100),
(55, 'HAMBURGUESA COMÚN', 'Hamburguesa de ternera con papas fritas; mayonesa, ketchup o mostaza', 320.00, 100),
(56, 'HAMBURGUESA ESPECIAL', 'Hamburguesa de ternera; queso; huevo frito; panceta; jamón; papas fritas; mayonesa, ketchup o mostaza', 420.00, 100),
(57, 'HAMBURGUESA VEGETARIANA COMÚN', 'Hamburguesa vegetariana con papas fritas; mayonesa, ketchup o mostaza', 450.00, 100),
(58, 'HAMBURGUESA VEGETARIANA ESPECIAL', 'Hamburguesa vegetariana; queso; huevo frito; papas fritas; mayonesa, ketchup o mostaza', 550.00, 100),
(59, 'CHIVITO PARA 1', 'churrasco de ternera con jamón; muzarella; panceta; huevo frito; tomate; lechuga; papas fritas; mayonesa, ketchup o mostaza', 520.00, 100),
(60, 'CHIVITO PARA 2', '2 churrascos de ternera con jamón; muzarella; panceta; huevos fritos; tomate; lechuga; papas fritas; mayonesa, ketchup o mostaza', 890.00, 100),
(61, 'CHORIZO AL PAN', 'Chorizo, tomate, lechuga, mayonesa, ketchup o mostaza', 220.00, 100),
(62, 'PAPAS BRAVAS', '', 320.00, 100),
(63, 'PAPAS FRITAS', '', 260.00, 100),
(64, 'PAPAS FRITAS C/2 HUEVOS FRITOS', '', 310.00, 100),
(65, 'PAPAS FRITAS CON CHEDDAR', '', 320.00, 100),
(66, 'PAPAS NOISETTES', '', 320.00, 100),
(67, 'PAPAS RÚSTICAS', '', 280.00, 100),
(68, 'PURÉ DE PAPAS', '', 250.00, 100),
(69, 'ENSALADA CÉSAR', '', 350.00, 100),
(70, 'ENSALADA MIXTA', 'lechuga, tomate y cebolla', 270.00, 100),
(71, 'CHURRASCO A LA PLANCHA', 'TERNERA O POLLO', 230.00, 100),
(72, 'NUGGETS DE POLLO', '', 170.00, 100),
(73, 'OMELETTE', '', 260.00, 100),
(74, 'OMELETTE JAMÓN Y QUESO', '', 260.00, 100),
(75, 'MILANESA DE TERNERA O POLLO', '', 260.00, 100),
(76, 'REVUELTO GRAMAJO', 'Papa, huevo, jamón, panceta, cebolla y queso', 490.00, 100),
(77, 'EMPANADAS', '', 75.00, 100),
(78, 'CROQUETAS DE PAPA', '', 190.00, 100),
(79, 'CROQUETAS DE ARROZ', '', 190.00, 100),
(80, 'PORCIÓN DE TARTA', 'carne dulce; carne salada; cebolla y panceta; chivito; jamón y queso; pascualina; pollo; zapallito', 149.00, 100),
(81, 'TALLARINES CON SALSA', '', 320.00, 100),
(82, 'RAVIOLES CON SALSA', '', 260.00, 100),
(83, 'ÑOQUIS CON SALSA', '', 310.00, 100),
(84, 'SALSAS', '4 quesos, caruso, tuco de carne', 190.00, 100),
(85, '2 REINAS', 'tequila, jugo de naranja, granadina', 290.00, 100),
(86, 'AMARGA CON VERMOUTH', '', 210.00, 100),
(87, 'APEROL SPRITZ', 'aperol, espumante, soda, naranja', 290.00, 100),
(88, 'BAILEYS', '', 190.00, 100),
(89, 'CAIPIRIÑA LIMA', 'cachaza, azúcar', 290.00, 100),
(90, 'CAIPIROSCA LIMA', 'vodka, azúcar', 290.00, 100),
(91, 'CAMPARI CON NARANJA', '', 290.00, 100),
(92, 'CUBA LIBRE', 'coca cola y ron', 290.00, 100),
(93, 'DAIKIRI', 'ron blanco, frutilla o durazno', 290.00, 100),
(94, 'FERNET CON COCA COLA', 'fernet', 180.00, 100),
(95, 'GIN TONIC', 'gin, tónica, limón', 290.00, 100),
(96, 'JAGER', 'jager, energizante o coca cola', 290.00, 100),
(97, 'MARGARITA', 'tequila, licor, jugo de limón, triple sec', 290.00, 100),
(98, 'MALIBÚ COCA COLA', 'malibú', 290.00, 100),
(99, 'MALIBÚ POMELO O NARANJA', 'malibú', 290.00, 100),
(100, 'MOJITO', 'menta, ron, lima, azúcar', 290.00, 100),
(101, 'NEGRONI', 'gin, campari, vermouth rosso', 290.00, 100),
(102, 'PIÑA COLADA', 'malibú, ron, ananá, crema', 290.00, 100),
(103, 'VERMOUTH', '', 150.00, 100),
(104, 'WHISCOLA IMPORTADO', '', 290.00, 100),
(105, 'WHISCOLA NACIONAL', '', 290.00, 100),
(106, 'WHISKY JHONIE WALKER ETIQUETA NEGRA', '', 280.00, 100),
(107, 'WHISKY JHONIE WALKER ETIQUETA ROJA', '', 210.00, 100),
(108, 'WHISKY NACIONAL DUNBAR GREGSONS', '', 170.00, 100),
(109, 'WHISKY SANDY MACEY RESTO', '', 210.00, 100),
(110, 'GRAPPA', '', 70.00, 100),
(111, 'GRAPPAMIEL', '', 90.00, 100),
(112, 'COMBO REINA 1', 'Hamburguesa de ternera; papas fritas; mayonesa, ketchup o mostaza; gaseosa 500ml o 600ml', 490.00, 100),
(113, 'COMBO REINA 2', 'Hamburguesa de ternera; queso; huevo frito; panceta; jamón; papas fritas; aderezos y gaseosa de 1lt', 990.00, 100),
(114, 'PICADA 2 REINAS PARA 2', 'Aceitunas, bondiola, jamón, mani, papas chips, quesos, salame, pan', 590.00, 100),
(115, 'PICADA 2 REINAS PARA 4', 'Aceitunas, bastoners de queso, bondiola, lomito, mani, mortadela, palichips, pan, papas chips, queso, salame, tostaditas', 1490.00, 100),
(116, 'ALFAJOR RED VELVET X1', '', 150.00, 100),
(117, 'ALFAJOR SALCHICHON X1', '', 110.00, 100),
(118, 'CHEESCAKE', '', 210.00, 100),
(119, 'CHOCO MAS', '', 210.00, 100),
(120, 'CLASICO DE DURAZNO', '', 210.00, 100),
(121, 'DE ANTOLOGIA', '', 210.00, 100),
(122, 'LEMON PIE', '', 210.00, 100),
(123, 'MANZANA SUTIL', '', 210.00, 100),
(124, 'MIL HOJAS (ROGEL)', '', 210.00, 100),
(125, 'RAMONA', '', 210.00, 100),
(126, 'RULO LOCO', '', 210.00, 100),
(127, 'SALCHICHON CHOCOLATE', '', 110.00, 100),
(128, 'TORTA SALCHICHON', '', 210.00, 100),
(129, 'TRES X TRES', '', 210.00, 100),
(130, 'VOLCAN CHOCOLATE X1', '', 160.00, 100),
(131, 'VOLCAN DULCE DE LECHE X1', '', 160.00, 100),
(132, 'CHAJA CLÁSICO DE DURAZNO', '', 230.00, 100),
(133, 'CHAJA SIN FRUTA', '', 230.00, 100),
(134, 'FLAN', '', 190.00, 100),
(135, 'FLAN CON DULCE DE LECHE', '', 210.00, 100),
(136, 'MILHOJAS PORCIÓN', '', 210.00, 100),
(137, 'LEMON PIE PORCIÓN', '', 210.00, 100),
(138, '1 BOCHAS DE HELADO', '', 130.00, 100),
(139, '2 BOCHAS DE HELADO', '', 160.00, 100),
(140, '3 BOCHAS DE HELADO', '', 190.00, 100),
(141, 'BROWNIE CON HELADO', '', 250.00, 100),
(142, 'MILHOJAS INDIVIDUAL', '', 260.00, 100),
(143, 'LEMON PIE INDIVIDUAL', '', 270.00, 100),
(144, 'BROWNIE INDIVIDUAL', '', 210.00, 100),
(145, 'ACEITUNAS', '', 420.00, 100),
(146, 'ANANÁ', '', 490.00, 100),
(147, 'ANANÁ Y JAMÓN', '', 490.00, 100),
(148, 'CALABRESA', '', 420.00, 100),
(149, 'CHOCLO Y JAMÓN', '', 490.00, 100),
(150, 'CUATRO QUESOS', '', 490.00, 100),
(151, 'HUEVO DURO', '', 420.00, 100),
(152, 'JAMÓN', '', 420.00, 100),
(153, 'LOMITO', '', 490.00, 100),
(154, 'MOZZARELLA', '', 390.00, 100),
(155, 'NAPOLITANA', '(tomate, orégano, mozzarella)', 490.00, 100),
(156, 'PALMITOS Y GOLF', '', 490.00, 100),
(157, 'PANCETA', '', 420.00, 100),
(158, 'PIZZA CON MOZZARELLA SIN GLUTEN', '', 425.00, 100),
(159, 'HAMBURGUESA CASERA AL PAN CON QUESO', '+ FRITAS + JUGO', 490.00, 100),
(160, '4 NUGGUETS', '+ FRITAS + JUGO', 450.00, 100),
(161, 'MILANESA TERNERA O POLLO AL PAN', '+ FRITAS + JUGO', 490.00, 100),
(162, 'PANCHO AL PAN', '+ FRITAS + JUGO', 350.00, 100),
(163, 'TALLARINES CON FILLETTO', '', 350.00, 100),
(164, 'PAN DE HAMBURGUESA O MILANESA SIN GLUTEN', '', 55.00, 100),
(165, 'AGUA SABORIZADA VITALE 1lt', '', 149.00, 100),
(166, 'AGUA SABORIZADA VITALE 625ml', '', 69.00, 100),
(167, 'AGUA SIN/CON GAS 500ml', '', 60.00, 100),
(168, 'CEPITA 995ml', '', 89.00, 100),
(169, 'JUGO DE NARANJA', '', 100.00, 100),
(170, 'JUGO DE NARANJA/ZANAHORIA', '', 110.00, 100),
(171, 'JUGO EXPRIMIDO DE NARANJA (VASO)', '', 160.00, 100),
(172, 'JUGUITO 200ml', '', 25.00, 100),
(173, 'JUGO ADES 200ml', '', 40.00, 100),
(174, 'LIMONADA 2 REINAS MENTA Y JENGIBRE', '', 220.00, 100),
(175, 'LINEA COCA COLA 1lt', '', 150.00, 100),
(176, 'LINEA COCA COLA 600ml', '', 95.00, 100),
(177, 'SMOOTHIES', '', 250.00, 100),
(178, 'MONSTER ENERGY', '', 130.00, 100),
(179, 'CORONA 330ml 0% ALCOHOL', '', 149.00, 100),
(180, 'CORONA 710ml', '', 230.00, 100),
(181, 'PATAGONIA 730ml', '', 260.00, 100),
(182, 'PATAGONIA IPA 24.7 730ml', '', 260.00, 100),
(183, 'PATRICIA LAGER 340ml', '', 95.00, 100),
(184, 'PATRICIA LAGER 960ml', '', 240.00, 100),
(185, 'PILSEN 960ml', '', 190.00, 100),
(186, 'PILSEN 340ml', '', 90.00, 100),
(187, 'PILSEN 960ml 0% ALCOHOL', '', 190.00, 100),
(188, 'STELLA ARTOIS 330ml', '(con o sin alcohol)', 190.00, 100),
(189, 'STELLA ARTOIS 975ml', '', 350.00, 100),
(190, 'SMIRNOFF ICE 275ml', '', 140.00, 100),
(191, 'VINO DE LA CASA (tinto)', '', 230.00, 100),
(192, 'VINO NOVECENTO MALBEC', '', 280.00, 100),
(193, 'VINO DON PASCUAL BRUT 750 ML', '', 390.00, 100),
(194, 'VINO DON PASCUAL COASTAL 750 ML', '', 590.00, 100),
(195, 'VINO DON PASCUAL RESERVA 750ML', '', 650.00, 100);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Administrador`
--
ALTER TABLE `Administrador`
  ADD PRIMARY KEY (`id_Empleado`);

--
-- Indices de la tabla `Contiene`
--
ALTER TABLE `Contiene`
  ADD PRIMARY KEY (`id_contiene`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `Ingresa`
--
ALTER TABLE `Ingresa`
  ADD PRIMARY KEY (`id_Empleado`,`id_Producto`),
  ADD KEY `id_Producto` (`id_Producto`);

--
-- Indices de la tabla `Pedido`
--
ALTER TABLE `Pedido`
  ADD PRIMARY KEY (`id_pedido`);

--
-- Indices de la tabla `Producto`
--
ALTER TABLE `Producto`
  ADD PRIMARY KEY (`id_Producto`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Contiene`
--
ALTER TABLE `Contiene`
  MODIFY `id_contiene` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Contiene`
--
ALTER TABLE `Contiene`
  ADD CONSTRAINT `contiene_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedido` (`id_pedido`),
  ADD CONSTRAINT `contiene_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_Producto`);

--
-- Filtros para la tabla `Ingresa`
--
ALTER TABLE `Ingresa`
  ADD CONSTRAINT `ingresa_ibfk_1` FOREIGN KEY (`id_Empleado`) REFERENCES `Administrador` (`id_Empleado`),
  ADD CONSTRAINT `ingresa_ibfk_2` FOREIGN KEY (`id_Producto`) REFERENCES `Producto` (`id_Producto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
