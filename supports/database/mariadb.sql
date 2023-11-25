CREATE DATABASE mydb;
CREATE TABLE mydb.users (
    id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

INSERT INTO mydb.users (name) VALUES ('user1'), ('user2'), ('user3');
