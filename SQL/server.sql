SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS currency;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS home_group;
DROP TABLE IF EXISTS home_role;
DROP TABLE IF EXISTS group_person;
DROP TABLE IF EXISTS shopping_list;
DROP TABLE IF EXISTS shopping_list_person;
DROP TABLE IF EXISTS shopping_list_entry;
DROP TABLE IF EXISTS cleaning_list_points;
DROP TABLE IF EXISTS newsfeed_post;
DROP TABLE IF EXISTS poll_options;
DROP TABLE IF EXISTS poll_vote;
DROP TABLE IF EXISTS todo;
DROP TABLE IF EXISTS todo_person;
DROP TABLE IF EXISTS budget_entry_type;
DROP TABLE IF EXISTS budget_entry;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE currency (
    currency_short VARCHAR(3) NOT NULL,
    currency_long VARCHAR(30) NOT NULL,
    CONSTRAINT currency_pk PRIMARY KEY(currency_short)
);

CREATE TABLE shopping_list (
    shopping_list_id INTEGER NOT NULL AUTO_INCREMENT,
    specific_currency VARCHAR(3),
    CONSTRAINT shopping_list_currency_fk FOREIGN KEY(specific_currency) REFERENCES currency(currency_short),
    CONSTRAINT shopping_list_pk PRIMARY KEY(shopping_list_id)
);

CREATE TABLE person (
    person_id INTEGER NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(1024) NOT NULL,
    forename NVARCHAR(255) NOT NULL,
    middlename NVARCHAR(255),
    lastname NVARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    birth_date DATE,
    is_verified BIT NOT NULL,
    gender INTEGER NOT NULL DEFAULT 0,
    profile_pic BLOB,
    last_active TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_password_token VARCHAR(255),
    shopping_list_id INTEGER NOT NULL,
    user_language VARCHAR(5) NOT NULL DEFAULT 'nb_NO',
    --CONSTRAINT person_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT person_pk PRIMARY KEY(person_id)
);

CREATE TABLE home_group ( 
    group_id INTEGER NOT NULL AUTO_INCREMENT,
    group_name NVARCHAR(50) NOT NULL,
    group_desc NVARCHAR(200) NOT NULL,
    group_type INTEGER NOT NULL,
    created_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_pic BLOB,
    cleaning_list_inerval INTEGER NOT NULL,
    default_currency VARCHAR(3) NOT NULL,
    shopping_list_id INTEGER NOT NULL,
    CONSTRAINT group_currency_fk FOREIGN KEY(default_currency) REFERENCES currency(currency_short),
    CONSTRAINT group_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT group_pk PRIMARY KEY(group_id)
);

CREATE TABLE home_role ( 
    role_id INTEGER NOT NULL AUTO_INCREMENT,
    role_name VARCHAR(20) NOT NULL,
    CONSTRAINT role_pk PRIMARY KEY(role_id)
);

CREATE TABLE group_person (
    person_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    joined_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role_id INTEGER NOT NULL,
    CONSTRAINT person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
    CONSTRAINT role_fk FOREIGN KEY(role_id) REFERENCES home_role(role_id),
    CONSTRAINT group_person_pk PRIMARY KEY(person_id, group_id)
);

CREATE TABLE shopping_list_person (
    shopping_list_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    paid_amount INTEGER NOT NULL,
    CONSTRAINT shopping_person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT shopping_list_persons_pk PRIMARY KEY(shopping_list_id, person_id)
);

CREATE TABLE shopping_list_entry (
    shopping_list_entry_id INTEGER NOT NULL,
    shopping_list_id INTEGER NOT NULL,
    entry_text NVARCHAR(25) NOT NULL,
    added_by_person_id INTEGER NOT NULL,
    purchased_by_person_id INTEGER DEFAULT NULL,
    cost INTEGER NOT NULL,
    datetime_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datetime_purchased DATETIME DEFAULT NULL,
    CONSTRAINT shopping_list_entry_person_added_fk FOREIGN KEY(added_by_person_id) REFERENCES person(person_id),
    CONSTRAINT shopping_list_entry_person_purchased_fk FOREIGN KEY(purchased_by_person_id) REFERENCES person(person_id),
    CONSTRAINT shopping_list_entry_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT shopping_list_entry_pk PRIMARY KEY(shopping_list_entry_id)
);

CREATE TABLE cleaning_list_points ( 
    person_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    month_year DATE NOT NULL,
    points INTEGER NOT NULL,
    CONSTRAINT cleaning_list_points PRIMARY KEY(person_id, group_id, month_year)
);

CREATE TABLE newsfeed_post (
    post_id INTEGER NOT NULL AUTO_INCREMENT,
    group_id INTEGER NOT NULL,
    posted_by_id INTEGER NOT NULL,
    post_text NVARCHAR(4000) NOT NULL,
    attachment_type INTEGER NOT NULL,
    attachment_data BLOB,
    posted_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT newsfeed_posted_by_fk FOREIGN KEY(posted_by_id) REFERENCES person(person_id),
    CONSTRAINT newsfeed_group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
    CONSTRAINT newsfeed_pk PRIMARY KEY(post_id)
);

CREATE TABLE poll_options (
    option_id INTEGER NOT NULL,
    option_text NVARCHAR(20) NOT NULL,
    post_id INTEGER NOT NULL,
    CONSTRAINT poll_options_post_fk FOREIGN KEY(post_id) REFERENCES newsfeed_post(post_id),
    CONSTRAINT poll_option_pk PRIMARY KEY(post_id, option_id)
);

CREATE TABLE poll_vote ( 
    post_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    CONSTRAINT poll_vote_post_fk FOREIGN KEY(post_id) REFERENCES newsfeed_post(post_id),
    CONSTRAINT poll_vote_person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT poll_vote_pk PRIMARY KEY(post_id, person_id)
);

CREATE TABLE todo (
    todo_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    todo_text NVARCHAR(200) NOT NULL,
    datetime_deadline DATETIME,
    datetime_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datetime_done DATETIME DEFAULT NULL,
    created_by_id INTEGER NOT NULL,
    done_by_id INTEGER NOT NULL,
    CONSTRAINT created_by_fk FOREIGN KEY(created_by_id) REFERENCES person(person_id),
    CONSTRAINT done_by_fk FOREIGN KEY(done_by_id) REFERENCES person(person_id),
    CONSTRAINT todo_pk PRIMARY KEY(todo_id)
);

CREATE TABLE todo_person (
    todo_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    CONSTRAINT todo_fk FOREIGN KEY(todo_id) REFERENCES todo(todo_id),
    CONSTRAINT todo_person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT todo_pk PRIMARY KEY(todo_id, person_id)
);

CREATE TABLE budget_entry_type ( 
    budget_entry_type_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    entry_type_name NVARCHAR(20) NOT NULL,
    entry_type_color VARCHAR(6) NOT NULL,
    CONSTRAINT budget_entry_type_group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
    CONSTRAINT budget_entry_type_pk PRIMARY KEY(budget_entry_type_id)
);

CREATE TABLE budget_entry (
    budget_entry_id INTEGER NOT NULL AUTO_INCREMENT,
    budget_entry_type_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    added_by_id INTEGER NOT NULL,
    amout INTEGER NOT NULL,
    text_note NVARCHAR(30),
    entry_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    peceipt_pic BLOB NOT NULL,
    CONSTRAINT budget_entry_type_fk FOREIGN KEY(budget_entry_type_id) REFERENCES budget_entry_type(budget_entry_type_id),
    CONSTRAINT budget_entry_group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
    CONSTRAINT budget_entry_person_fk FOREIGN KEY(added_by_id) REFERENCES person(person_id),
    CONSTRAINT budget_entry_pk PRIMARY KEY(budget_entry_id)
);

INSERT INTO g_tdat2003_t4.person (email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) 
	VALUES ('test@test.com', 'testnavn', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'test', NULL, 'test', '23456', CURRENT_DATE, true, 0, NULL, DEFAULT, NULL, 0, DEFAULT)
