-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 09, 2025 at 06:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `Departments`
--

CREATE TABLE `Departments` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Departments`
--

INSERT INTO `Departments` (`Id`, `Name`) VALUES
(8, 'Accounting'),
(2, 'Administrative'),
(9, 'Finance'),
(1, 'HR'),
(10, 'IT'),
(7, 'Marketing'),
(3, 'Operations'),
(4, 'Product'),
(5, 'Purchasing'),
(6, 'Sales');

-- --------------------------------------------------------

--
-- Table structure for table `Employees`
--

CREATE TABLE `Employees` (
  `Id` int(11) NOT NULL,
  `FirstName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) DEFAULT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Gender` varchar(255) DEFAULT NULL,
  `HireDate` datetime DEFAULT NULL,
  `BirthDate` datetime DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Country` varchar(255) DEFAULT NULL,
  `City` varchar(255) DEFAULT NULL,
  `MarriedStatus` int(11) DEFAULT NULL,
  `HaveChildren` int(11) DEFAULT NULL,
  `NumberOfChildren` int(11) DEFAULT NULL,
  `DistanceToWork` int(11) DEFAULT NULL,
  `EducationLevel` varchar(255) DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  `JobLevel` varchar(200) DEFAULT NULL,
  `WorkModel` varchar(200) DEFAULT NULL,
  `JobSatisfaction` int(11) DEFAULT 3,
  `EnvironmentSatisfaction` int(11) DEFAULT 3,
  `RelationshipSatisfaction` int(11) DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Employees`
--

INSERT INTO `Employees` (`Id`, `FirstName`, `LastName`, `Email`, `Phone`, `Gender`, `HireDate`, `BirthDate`, `Address`, `Country`, `City`, `MarriedStatus`, `HaveChildren`, `NumberOfChildren`, `DistanceToWork`, `EducationLevel`, `UserId`, `JobLevel`, `WorkModel`, `JobSatisfaction`, `EnvironmentSatisfaction`, `RelationshipSatisfaction`) VALUES
(68, 'ergazomenos', 'ena', 'lazarospsa1@hotmail.com', '1', 'male', '2010-01-12 00:00:00', '0001-01-01 00:00:00', '1', '1', '1', 0, 0, 0, 0, '1', 24, 'senior', 'hybrid', 1, 1, 1),
(79, ' ', ' ', 'lazarospsa2@hotmail.com', NULL, NULL, '2012-06-12 00:00:00', '0001-01-01 00:00:00', NULL, NULL, NULL, 0, 0, 0, 0, NULL, 34, NULL, NULL, 3, 3, 3),
(80, ' ', ' ', 'lazarospsa3@hotmail.com', NULL, NULL, '0001-01-01 00:00:00', '0001-01-01 00:00:00', NULL, NULL, NULL, 0, 0, 0, 0, NULL, 35, NULL, NULL, 3, 3, 3),
(81, ' ', ' ', 'lazarospsa4@hotmail.com', NULL, NULL, '0001-01-01 00:00:00', '0001-01-01 00:00:00', NULL, NULL, NULL, 0, 0, 0, 0, NULL, 36, NULL, NULL, 3, 3, 3),
(82, ' ', ' ', 'lazarospsa5@hotmail.com', NULL, NULL, '0001-01-01 00:00:00', '0001-01-01 00:00:00', NULL, NULL, NULL, 0, 0, 0, 0, NULL, 37, NULL, NULL, 3, 3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `Employees_Departments`
--

CREATE TABLE `Employees_Departments` (
  `Id` int(11) NOT NULL,
  `EmployeeId` int(11) NOT NULL,
  `DepartmentId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Employees_Departments`
--

INSERT INTO `Employees_Departments` (`Id`, `EmployeeId`, `DepartmentId`) VALUES
(21, 72, 10),
(22, 73, 10),
(23, 68, 10),
(24, 74, 10),
(25, 75, 10),
(26, 76, 10),
(27, 77, 10),
(28, 78, 10),
(29, 79, 4),
(30, 80, 10),
(31, 81, 10),
(32, 82, 3);

-- --------------------------------------------------------

--
-- Table structure for table `Leaves`
--

CREATE TABLE `Leaves` (
  `Id` int(11) NOT NULL,
  `EmployeeId` int(11) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Reason` text DEFAULT NULL,
  `Status` enum('Pending','Approved','Rejected') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Leaves`
--

INSERT INTO `Leaves` (`Id`, `EmployeeId`, `StartDate`, `EndDate`, `Reason`, `Status`) VALUES
(1, 68, '2025-02-18', '2025-02-25', 'αδεια1112', 'Rejected'),
(2, 68, '2025-02-28', '2025-03-03', 'aaaa', 'Pending'),
(3, 79, '2025-02-18', '2025-03-08', 'a1', 'Pending'),
(4, 68, '2025-02-25', '2025-02-28', 'aaa', 'Approved'),
(5, 68, '2025-01-18', '0001-01-01', 'aa', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `Managers_Departments`
--

CREATE TABLE `Managers_Departments` (
  `Id` int(11) NOT NULL,
  `EmployeeId` int(11) NOT NULL,
  `DepartmentId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Managers_Departments`
--

INSERT INTO `Managers_Departments` (`Id`, `EmployeeId`, `DepartmentId`) VALUES
(9, 68, 10),
(10, 79, 4);

-- --------------------------------------------------------

--
-- Table structure for table `Salaries`
--

CREATE TABLE `Salaries` (
  `Id` int(11) NOT NULL,
  `EmployeeId` int(11) NOT NULL,
  `Amount` float NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `SubmitterId` int(11) NOT NULL,
  `Status` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Salaries`
--

INSERT INTO `Salaries` (`Id`, `EmployeeId`, `Amount`, `created_at`, `SubmitterId`, `Status`) VALUES
(1, 68, 1550, '2025-03-03 21:57:56', 24, 'Done');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `Id` int(11) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `PasswordHash` text NOT NULL,
  `Role` enum('Admin','Manager','User') NOT NULL,
  `RefreshToken` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`RefreshToken`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`Id`, `Email`, `PasswordHash`, `Role`, `RefreshToken`) VALUES
(1, 'lazarospsa@hotmail.com', 'uYiM9IiNO5tkVEOzTQwQnA==:1TIhtDGzL1fV46zoDYNOBagApHQ2thOHNZaB7QE9YoA=', 'Admin', NULL),
(24, 'lazarospsa1@hotmail.com', 'nZ0xfPanHWB4XDJY1TiaVQ==:yySCPB/9KCzPfPmmxvpiEO/CRsM2FEcCQbxNWXZcses=', 'User', NULL),
(34, 'lazarospsa2@hotmail.com', 'k8djmmyLNRb3gSabMfDkew==:tPrEPHgwHkCptEYxP1CYs4+LCJyEF8rEqvXHWH08YFg=', 'User', NULL),
(35, 'lazarospsa3@hotmail.com', 'Hedq8rZyvJfiBmC0H9xfJQ==:RDUHAL+/aavZfKB4OYuKVxtRy6OZLYI73JQRUA/pjos=', 'User', NULL),
(36, 'lazarospsa4@hotmail.com', 'wF4HShpuevIK5P4hbDzM5w==:dAAq8ut+fgASWpDDwNcISAtRea3hwL6+AmqgBE5tLTw=', 'User', NULL),
(37, 'lazarospsa5@hotmail.com', 'OpkSPh1csmkjzIApG27oGQ==:PrqpgFErGxJJ3gT/qeD3ZhTQYdh+Cjokt/dfUbZYzkg=', 'User', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Departments`
--
ALTER TABLE `Departments`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- Indexes for table `Employees`
--
ALTER TABLE `Employees`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `Employees_Departments`
--
ALTER TABLE `Employees_Departments`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `EmployeeId` (`EmployeeId`),
  ADD KEY `DepartmentId` (`DepartmentId`);

--
-- Indexes for table `Leaves`
--
ALTER TABLE `Leaves`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `EmployeeId` (`EmployeeId`);

--
-- Indexes for table `Managers_Departments`
--
ALTER TABLE `Managers_Departments`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `Salaries`
--
ALTER TABLE `Salaries`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Departments`
--
ALTER TABLE `Departments`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `Employees`
--
ALTER TABLE `Employees`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `Employees_Departments`
--
ALTER TABLE `Employees_Departments`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `Leaves`
--
ALTER TABLE `Leaves`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Managers_Departments`
--
ALTER TABLE `Managers_Departments`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Salaries`
--
ALTER TABLE `Salaries`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Leaves`
--
ALTER TABLE `Leaves`
  ADD CONSTRAINT `Leaves_ibfk_1` FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`Id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
