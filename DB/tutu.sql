-- phpMyAdmin SQL Dump
-- version 4.6.6deb4
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 28-11-2018 a las 22:41:16
-- Versión del servidor: 10.1.23-MariaDB-9+deb9u1
-- Versión de PHP: 7.0.30-0+deb9u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tutu`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actual_clients`
--

CREATE TABLE `actual_clients` (
  `id` int(11) NOT NULL,
  `patente` varchar(7) NOT NULL,
  `img_patente` varchar(200) NOT NULL,
  `llegada` datetime NOT NULL,
  `tipo_vehiculo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `id_cliente` varchar(100) NOT NULL,
  `id_pago` varchar(100) NOT NULL,
  `7` varchar(10) NOT NULL,
  `patente` varchar(20) NOT NULL,
  `entrada` datetime NOT NULL,
  `salida` datetime NOT NULL,
  `slot` int(11) NOT NULL,
  `pagado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `id_cliente`, `id_pago`, `7`, `patente`, `entrada`, `salida`, `slot`, `pagado`) VALUES
(1, '0', '207628513-d5cd7f73-f63d-4211-b1fc-e9f55c4e3eb9', '', '', '2018-11-24 10:58:27', '2018-11-24 11:58:27', 200, 0),
(2, '0', '207628513-dcb7d760-5e13-4e38-aa06-7ca70a3cd168', '', '', '2018-11-24 11:07:27', '2018-11-24 12:07:27', 200, 0),
(3, '0', '207628513-a3fff4b2-06aa-4dcc-8b6c-f7d0962e8782', '', '', '2018-11-24 11:11:45', '2018-11-24 12:11:45', 200, 0),
(4, '0', '207628513-1ef2159f-6156-4501-9169-f1b28bcf4b07', '', '', '2018-11-24 11:18:53', '2018-11-24 15:18:53', 208, 0),
(5, '19f7spX4oLOvTGZgr9Ic8HYuu8D2', '207628513-1127a865-2086-48b8-bec2-0cd2502be1b7', '', '', '2018-11-24 11:36:02', '2018-11-24 12:36:02', 200, 0),
(6, '19f7spX4oLOvTGZgr9Ic8HYuu8D2', '207628513-840d8160-3e18-4cee-be10-a42b6342a2a1', '', '', '2018-11-24 11:36:30', '2018-11-24 12:36:30', 200, 0),
(7, '19f7spX4oLOvTGZgr9Ic8HYuu8D2', '207628513-fa15430d-4e12-456f-b1f3-fc1eb9e6f8f5', '2bTek0z', '', '2018-11-24 11:42:13', '2018-11-24 12:42:13', 200, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `slots`
--

CREATE TABLE `slots` (
  `id` int(11) NOT NULL,
  `state` enum('LIBRE','OCUPADO','','') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `slots`
--

INSERT INTO `slots` (`id`, `state`) VALUES
(200, 'LIBRE'),
(201, 'LIBRE'),
(202, 'LIBRE'),
(203, 'LIBRE'),
(204, 'LIBRE'),
(205, 'LIBRE'),
(206, 'LIBRE'),
(207, 'LIBRE'),
(208, 'LIBRE'),
(209, 'LIBRE'),
(210, 'LIBRE'),
(211, 'LIBRE'),
(212, 'LIBRE'),
(213, 'LIBRE'),
(214, 'LIBRE'),
(215, 'LIBRE'),
(216, 'LIBRE'),
(217, 'LIBRE'),
(218, 'LIBRE'),
(219, 'LIBRE'),
(220, 'LIBRE'),
(221, 'LIBRE'),
(222, 'LIBRE'),
(223, 'OCUPADO'),
(224, 'OCUPADO'),
(225, 'OCUPADO'),
(226, 'OCUPADO'),
(227, 'OCUPADO'),
(228, 'OCUPADO'),
(229, 'OCUPADO'),
(230, 'OCUPADO'),
(231, 'OCUPADO'),
(232, 'OCUPADO'),
(233, 'OCUPADO'),
(234, 'OCUPADO'),
(235, 'OCUPADO'),
(236, 'OCUPADO'),
(237, 'OCUPADO'),
(238, 'OCUPADO'),
(239, 'OCUPADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users_app`
--

CREATE TABLE `users_app` (
  `id` varchar(100) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users_app`
--

INSERT INTO `users_app` (`id`, `nombre`, `email`, `password`) VALUES
('19f7spX4oLOvTGZgr9Ic8HYuu8D2', 'Bartolomeo Adrian Gonzalez', '', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actual_clients`
--
ALTER TABLE `actual_clients`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `slots`
--
ALTER TABLE `slots`
  ADD UNIQUE KEY `id` (`id`);

--
-- Indices de la tabla `users_app`
--
ALTER TABLE `users_app`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actual_clients`
--
ALTER TABLE `actual_clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
