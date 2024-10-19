-- CREATE DATABASE CocinApp;

/*
-- TABLA USUARIO
CREATE TABLE Users (
	id_user  INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(30) NOT NULL,
	passwd   VARCHAR(255) NOT NULL
);
*/

/*
-- CREAR TABLA RECETAS
CREATE TABLE Recipes (
	id_recipe   INT AUTO_INCREMENT PRIMARY KEY,
	name_recipe VARCHAR(255)  NOT NULL,
	dif_recipe  ENUM('facil','medio','dificil') NOT NULL,
	ing_recipe  VARCHAR(1024) NOT NULL,  
	desc_recipe VARCHAR(255)  NOT NULL,
	stps_recipe VARCHAR(4096) NOT NULL,
	time_recipe INT(4)    NOT NULL,
	img_recipe  VARCHAR(255)  NOT NULL,
	id_user     INT           NOT NULL		  
);
*/

CREATE TABLE Categories(
	id_category INT AUTO_INCREMENT,
	category VARCHAR(50) NOT NULL,
	id_recipe INT NOT NULL,
	PRIMARY KEY (id_category, id_recipe)	
);

