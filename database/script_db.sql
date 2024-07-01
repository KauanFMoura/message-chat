-- MySQL Script generated by MySQL Workbench
-- dom 30 jun 2024 17:32:43
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema whatsut
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema whatsut
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `whatsut` ;
USE `whatsut` ;

-- -----------------------------------------------------
-- Table `whatsut`.`file`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `whatsut`.`file` (
  `file_uuid` VARCHAR(40) NOT NULL,
  `file_name` VARCHAR(100) NOT NULL,
  `file_ext` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`file_uuid`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `whatsut`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `whatsut`.`user` (
  `usu_id` INT NOT NULL AUTO_INCREMENT,
  `usu_username` VARCHAR(20) NOT NULL,
  `usu_password` VARCHAR(200) NOT NULL,
  `usu_displayname` VARCHAR(100) NOT NULL,
  `usu_profile_image_uuid` VARCHAR(40) NULL,
  `usu_status` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`usu_id`),
  UNIQUE INDEX `usu_username_UNIQUE` (`usu_username` ASC) VISIBLE,
  INDEX `user_file_idx` (`usu_profile_image_uuid` ASC) VISIBLE,
  CONSTRAINT `user_file`
    FOREIGN KEY (`usu_profile_image_uuid`)
    REFERENCES `whatsut`.`file` (`file_uuid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `whatsut`.`group`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `whatsut`.`group` (
  `gp_id` INT NOT NULL AUTO_INCREMENT,
  `gp_name` VARCHAR(100) NOT NULL,
  `gp_creator` INT NOT NULL,
  `gp_exclusion_type` INT NOT NULL,
  `gp_description` VARCHAR(100) NULL,
  `gp_image_uuid` VARCHAR(100) NULL,
  PRIMARY KEY (`gp_id`),
  INDEX `gp_user_idx` (`gp_creator` ASC) VISIBLE,
  INDEX `gp_file_idx` (`gp_image_uuid` ASC) VISIBLE,
  CONSTRAINT `gp_user`
    FOREIGN KEY (`gp_creator`)
    REFERENCES `whatsut`.`user` (`usu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `gp_file`
    FOREIGN KEY (`gp_image_uuid`)
    REFERENCES `whatsut`.`file` (`file_uuid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `whatsut`.`group_has_user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `whatsut`.`group_has_user` (
  `ghu_user_id` INT NOT NULL,
  `ghu_group_id` INT NOT NULL,
  `ghu_is_admin` TINYINT NOT NULL,
  `ghu_entry_date` DATETIME NOT NULL,
  PRIMARY KEY (`ghu_user_id`, `ghu_group_id`),
  INDEX `ghu_group_idx` (`ghu_group_id` ASC) VISIBLE,
  CONSTRAINT `ghu_user`
    FOREIGN KEY (`ghu_user_id`)
    REFERENCES `whatsut`.`user` (`usu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `ghu_group`
    FOREIGN KEY (`ghu_group_id`)
    REFERENCES `whatsut`.`group` (`gp_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `whatsut`.`private_message`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `whatsut`.`private_message` (
  `pv_id` INT NOT NULL AUTO_INCREMENT,
  `pv_sender` INT NOT NULL,
  `pv_recipient` INT NOT NULL,
  `pv_message` VARCHAR(500) NOT NULL,
  `pv_datetime` DATETIME NOT NULL,
  `pv_file_uuid` VARCHAR(40) NULL,
  PRIMARY KEY (`pv_id`),
  INDEX `pv_user1_idx` (`pv_sender` ASC) VISIBLE,
  INDEX `pv_user2_idx` (`pv_recipient` ASC) VISIBLE,
  INDEX `pv_file_idx` (`pv_file_uuid` ASC) VISIBLE,
  CONSTRAINT `pv_user1`
    FOREIGN KEY (`pv_sender`)
    REFERENCES `whatsut`.`user` (`usu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `pv_user2`
    FOREIGN KEY (`pv_recipient`)
    REFERENCES `whatsut`.`user` (`usu_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `pv_file`
    FOREIGN KEY (`pv_file_uuid`)
    REFERENCES `whatsut`.`file` (`file_uuid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `whatsut`.`group_message`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `whatsut`.`group_message` (
  `gm_id` INT NOT NULL,
  `gm_sender` INT NOT NULL,
  `gm_group_id` INT NOT NULL,
  `gm_message` VARCHAR(500) NOT NULL,
  `gm_datetime` DATETIME NOT NULL,
  `gm_file_uuid` VARCHAR(40) NULL,
  PRIMARY KEY (`gm_id`),
  INDEX `gm_ghu_idx` (`gm_sender` ASC, `gm_group_id` ASC) VISIBLE,
  INDEX `gm_file_idx` (`gm_file_uuid` ASC) VISIBLE,
  CONSTRAINT `gm_ghu`
    FOREIGN KEY (`gm_sender` , `gm_group_id`)
    REFERENCES `whatsut`.`group_has_user` (`ghu_user_id` , `ghu_group_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `gm_file`
    FOREIGN KEY (`gm_file_uuid`)
    REFERENCES `whatsut`.`file` (`file_uuid`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
