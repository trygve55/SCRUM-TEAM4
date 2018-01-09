SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Person;
SET FOREIGN_KEY_CHECKS = 1;

CREATE Currency (
	currency_short VARCHAR(3) NOT NULL,
	currency_long VARCHAR(30) NOT NULL,
	CONSTRAINT currency_pk PRIMARY KEY(currency_short)
);

CREATE TABLE Person (
    person_id INTEGER NOT NULL AUTO_INCREMENT,
	email VARCHAR(255) NOT NULL,
	username VARCHAR(20) UNIQUE NOT NULL,
	password_hash VARBINARY(1024) NOT NULL,
    salt VARBINARY(1024) NOT NULL,
	forename NVARCHAR(255) NOT NULL,
	middlename NVARCHAR(255),
	lastname NVARCHAR(255) NOT NULL,
	phone VARCHAR(15) NOT NULL,
	birth_date DATE NOT NULL,
	is_verified BIT NOT NULL,
	gender INTEGER NOT NULL,
	profile_pic VARCHAR(MAX),
	last_active TIMESTAMP,
	reset_password_token VARCHAR(255),
	shopping_list_id INTEGER NOT NULL,
	CONSTRAINT person_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES Shopping_List(shopping_list_id),
	CONSTRAINT person_pk PRIMARY KEY(person_id)
);

CREATE TABLE Groups ( 
	group_id INTEGER NOT NULL AUTO_INCREMENT,
	group_name NVARCHAR(50) NOT NULL,
	group_desc NVARCHAR(200) NOT NULL,
	group_type INTEGER NOT NULL,
	date_created DATE NOT NULL,
	group_pic VARCHAR(MAX),
	cleaning_list_inerval INTEGER NOT NULL,
	default_currency VARCHAR(3) NOT NULL,
	shopping_list_id INTEGER NOT NULL
	CONSTRAINT group_currency_fk FOREIGN KEY(default_currency) REFERENCES Currency(currency_short),
	CONSTRAINT group_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES Shopping_List(shopping_list_id),
	CONSTRAINT group_pk PRIMARY KEY(group_id)
);

CREATE TABLE Role ( 
	role_id INTEGER NOT NULL AUTO_INCREMENT,
	role_name VARCHAR NOT NULL,
	CONSTRAINT role_pk PRIMARY KEY(role_id)
);

CREATE TABLE Group_Person (
	person_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	date_joined DATE NOT NULL,
	role_id INTEGER NOT NULL,
	CONSTRAINT person_fk FOREIGN KEY(person_id) REFERENCES Person(person_id),
	CONSTRAINT group_fk FOREIGN KEY(group_id) REFERENCES Groups(group_id),
	CONSTRAINT role_fk FOREIGN KEY(role_id) REFERENCES Role(role_id),
	CONSTRAINT group_person_pk PRIMARY KEY(person_id, group_id)
);

CREATE TABLE Shopping_List (
	shopping_list_id INTEGER NOT NULL AUTO_INCREMENT,
	specific_currency VARCHAR(3),
	CONSTRAINT shopping list_currency_fk FOREIGN KEY(specific_currency) REFERENCES Currency(currency_short),
	CONSTRAINT shopping_list_pk PRIMARY KEY(shopping_list_id)
);

CREATE TABLE Shopping_List_Persons (
	shopping_list_id INTEGER NOT NULL,
	person_id INTEGER NOT NULL,
	paid_amount INTEGER NOT NULL,
	CONSTRAINT person_fk FOREIGN KEY(person_id) REFERENCES Person(person_id),
	CONSTRAINT shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES Shopping_List(shopping_list_id),
	CONSTRAINT shopping_list_persons_pk PRIMARY KEY(shopping_list_id, person_id)
);

CREATE TABLE Shopping_List_Entry (
	shopping_list_entry_id INTEGER NOT NULL,
	shopping_list_id INTEGER NOT NULL,
	entry_text NVARCHAR(25) NOT NULL,
	purchased_by_person_id INTEGER NOT NULL,
	cost INTEGER NOT NULL,
	timestamp_added TIMESTAMP NOT NULL,
	timestamp_purchased TIMESTAMP,
	CONSTRAINT shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES Shopping_List(shopping_list_id),
	CONSTRAINT shopping_list_entry_pk PRIMARY KEY(shopping_list_entry_id)
);

CREATE TABLE Cleaning_List_Points ( 
	person_id INTEGER NOT NULL,
	group_id INTEGER NOT NULL,
	month_year DATE NOT NULL,
	points INTEGER NOT NULL,
	CONSTRAINT cleaning_list_points PRIMARY KEY(person_id, group_id, month_year)
);

CREATE TABLE Newsfeed_Post (
	post_id INTEGER NOT NULL AUTO_INCREMENT,
	group_id INTEGER NOT NULL,
	posted_by_id INTEGER NOT NULL,
	post_text NVARCHAR(4000) NOT NULL,
	attachment_type INTEGER NOT NULL,
	attachment_data VARCHAR(MAX),
	posted_timestamp TIMESTAMP NOT NULL,
	CONSTRAINT posted_by_fk FOREIGN KEY(posted_by_id) REFERENCES Person(person_id),
	CONSTRAINT group_fk FOREIGN KEY(group_id) REFERENCES Groups(group_id),
	CONSTRAINT newsfeed_fk PRIMARY KEY(post_id)
);

CREATE TABLE Poll_Options (
	option_id INTEGER NOT NULL,
	option_text NVARCHAR(20) NOT NULL,
	post_id INTEGER NOT NULL,
	CONSTRAINT post_poll_fk FOREIGN KEY(post_id) REFERENCES Newsfeed_Post(post_id),
	CONSTRAINT poll_option_pk PRIMARY KEY(post_id, option_id)
);

CREATE TABLE Poll_Vote ( 
	post_id INTEGER NOT NULL,
	option_id INTEGER NOT NULL,
	person_id INTEGER NOT NULL,
	CONSTRAINT poll_vote_pk PRIMARY KEY(post_id, option_id, person_id)
);