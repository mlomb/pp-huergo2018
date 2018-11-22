-- phpMyAdmin SQL Dump
-- version 4.6.6deb4
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 21-11-2018 a las 22:25:45
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
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` varchar(6) NOT NULL,
  `entrada` datetime NOT NULL,
  `salida` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(223, 'LIBRE'),
(224, 'LIBRE'),
(225, 'LIBRE'),
(226, 'LIBRE'),
(227, 'LIBRE'),
(228, 'LIBRE'),
(229, 'LIBRE'),
(230, 'LIBRE'),
(231, 'LIBRE'),
(232, 'LIBRE'),
(233, 'LIBRE'),
(234, 'LIBRE'),
(235, 'LIBRE'),
(236, 'LIBRE'),
(237, 'LIBRE'),
(238, 'LIBRE'),
(239, 'LIBRE');

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
  ADD UNIQUE KEY `id` (`id`);

--
-- Indices de la tabla `slots`
--
ALTER TABLE `slots`
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actual_clients`
--
ALTER TABLE `actual_clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
