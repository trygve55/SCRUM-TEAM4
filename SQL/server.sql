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
DROP TABLE IF EXISTS private_todo;
DROP TABLE IF EXISTS todo;
DROP TABLE IF EXISTS todo_person;
DROP TABLE IF EXISTS budget_entry_type;
DROP TABLE IF EXISTS budget_entry;
DROP TABLE IF EXISTS budget_entry_person;
DROP TABLE IF EXISTS person_budget_entry;
DROP TABLE IF EXISTS private_todo_entry;
DROP TABLE IF EXISTS private_todo_list;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE currency (
    currency_id INTEGER NOT NULL AUTO_INCREMENT,
    currency_short VARCHAR(3) NOT NULL,
    currency_long VARCHAR(70) NOT NULL,
    currency_sign NVARCHAR(4),
    currency_major BIT NOT NULL DEFAULT 0, 
    CONSTRAINT currency_pk PRIMARY KEY(currency_id)
);

CREATE TABLE shopping_list (
    shopping_list_id INTEGER NOT NULL AUTO_INCREMENT,
    shopping_list_name NVARCHAR(30),
    currency_id INTEGER NOT NULL,
    color_hex INTEGER,
    CONSTRAINT shopping_list_currency_fk FOREIGN KEY(currency_id) REFERENCES currency(currency_id),
    CONSTRAINT shopping_list_pk PRIMARY KEY(shopping_list_id)
);

CREATE TABLE person (
    person_id INTEGER NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash CHAR(60),
    forename NVARCHAR(255) NOT NULL,
    middlename NVARCHAR(255),
    lastname NVARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    birth_date DATE,
    is_verified BIT NOT NULL DEFAULT 0,
    gender INTEGER DEFAULT 0,
    profile_pic MEDIUMBLOB,
    profile_pic_tiny BLOB,
    has_profile_pic BIT NOT NULL DEFAULT 0,
    last_active TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_password_token VARCHAR(255),
    shopping_list_id INTEGER NOT NULL UNIQUE,
    user_language VARCHAR(5) NOT NULL DEFAULT 'nb_NO',
    user_deactivated BIT NOT NULL DEFAULT 0,
    facebook_api_id BIGINT UNIQUE,
    CONSTRAINT person_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT person_pk PRIMARY KEY(person_id)
);

CREATE TABLE home_group ( 
    group_id INTEGER NOT NULL AUTO_INCREMENT,
    group_name NVARCHAR(50) NOT NULL,
    group_desc NVARCHAR(200),
    group_type INTEGER NOT NULL DEFAULT 0,
    created_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cleaning_list_interval INTEGER NOT NULL DEFAULT 0,
    group_pic MEDIUMBLOB,
    group_pic_tiny BLOB,
    has_group_pic BIT NOT NULL DEFAULT 0,
    default_currency_id INTEGER NOT NULL,
    shopping_list_id INTEGER NOT NULL,
    CONSTRAINT group_currency_fk FOREIGN KEY(default_currency_id) REFERENCES currency(currency_id),
    CONSTRAINT group_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT group_pk PRIMARY KEY(group_id)
);

CREATE TABLE home_role ( 
    role_id INTEGER NOT NULL,
    role_name VARCHAR(20) NOT NULL,
    CONSTRAINT role_pk PRIMARY KEY(role_id)
);

CREATE TABLE group_person (
    person_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    joined_timestamp DATETIME,
    role_id INTEGER NOT NULL DEFAULT 1,
    invite_accepted BIT NOT NULL DEFAULT 0,
    was_invited BIT NOT NULL DEFAULT 0,
    invite_sent_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
    CONSTRAINT role_fk FOREIGN KEY(role_id) REFERENCES home_role(role_id),
    CONSTRAINT group_person_pk PRIMARY KEY(person_id, group_id)
);

CREATE TABLE shopping_list_person (
    shopping_list_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    invite_accepted BIT NOT NULL DEFAULT 0,
    invite_sent_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_hidden BIT NOT NULL DEFAULT 0,
    CONSTRAINT shopping_person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT shopping_list_persons_pk PRIMARY KEY(shopping_list_id, person_id)
);

CREATE TABLE budget_entry_type ( 
    budget_entry_type_id INTEGER NOT NULL AUTO_INCREMENT,
    shopping_list_id INTEGER NOT NULL,
    entry_type_name NVARCHAR(20) NOT NULL,
    entry_type_color INTEGER,
    CONSTRAINT budget_entry_type_shopping_list_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT budget_entry_type_pk PRIMARY KEY(budget_entry_type_id)
);

CREATE TABLE budget_entry (
    budget_entry_id INTEGER NOT NULL AUTO_INCREMENT,
    budget_entry_type_id INTEGER,
    shopping_list_id INTEGER NOT NULL,
    added_by_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    text_note NVARCHAR(30),
    entry_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    receipt_pic MEDIUMBLOB,
    CONSTRAINT budget_entry_type_fk FOREIGN KEY(budget_entry_type_id) REFERENCES budget_entry_type(budget_entry_type_id),
    CONSTRAINT budget_entry_type_shopping_list_fk2 FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT budget_entry_person_fk FOREIGN KEY(added_by_id) REFERENCES person(person_id),
    CONSTRAINT budget_entry_pk PRIMARY KEY(budget_entry_id)
);

CREATE TABLE shopping_list_entry (
    shopping_list_entry_id INTEGER NOT NULL AUTO_INCREMENT,
    shopping_list_id INTEGER NOT NULL,
    entry_text NVARCHAR(255) NOT NULL,
    added_by_person_id INTEGER NOT NULL,
    purchased_by_person_id INTEGER DEFAULT NULL,
    cost INTEGER NOT NULL DEFAULT 0,
    datetime_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datetime_purchased DATETIME DEFAULT NULL,
    budget_entry_id INTEGER,
    CONSTRAINT shopping_list_entry_person_added_fk FOREIGN KEY(added_by_person_id) REFERENCES person(person_id),
    CONSTRAINT shopping_list_entry_person_purchased_fk FOREIGN KEY(purchased_by_person_id) REFERENCES person(person_id),
    CONSTRAINT shopping_list_entry_fk FOREIGN KEY(shopping_list_id) REFERENCES shopping_list(shopping_list_id),
    CONSTRAINT shopping_list_budget_entry__fk FOREIGN KEY(budget_entry_id) REFERENCES budget_entry(budget_entry_id),
    CONSTRAINT shopping_list_entry_pk PRIMARY KEY(shopping_list_entry_id)
);

CREATE TABLE cleaning_list_points ( 
    person_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    month_year DATE NOT NULL,
    points INTEGER NOT NULL,
    CONSTRAINT cleaning_list_person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT cleaning_list_group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
    CONSTRAINT cleaning_list_pk PRIMARY KEY(person_id, group_id, month_year)
);

CREATE TABLE newsfeed_post (
    post_id INTEGER NOT NULL AUTO_INCREMENT,
    group_id INTEGER NOT NULL,
    posted_by_id INTEGER NOT NULL,
    post_text NVARCHAR(4000) NOT NULL,
    attachment_type INTEGER NOT NULL DEFAULT 0,
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

CREATE TABLE private_todo_list (
    private_todo_list_id INTEGER NOT NULL AUTO_INCREMENT,
    private_todo_list_name NVARCHAR(30),
    person_id INTEGER NOT NULL,
    is_deactivated BIT NOT NULL DEFAULT 0,
    color_hex INTEGER,
    CONSTRAINT private_todo_person_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT priavte_todo_list_pk PRIMARY KEY(private_todo_list_id)
);

CREATE TABLE private_todo_entry (
    private_todo_entry_id INTEGER NOT NULL AUTO_INCREMENT,
    private_todo_list_id INTEGER NOT NULL,
    todo_text NVARCHAR(200) NOT NULL,
    datetime_deadline DATETIME,
    datetime_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datetime_done DATETIME DEFAULT NULL,
    CONSTRAINT private_todo_list_entry_fk FOREIGN KEY(private_todo_list_id) REFERENCES private_todo_list(private_todo_list_id),
    CONSTRAINT private_todo_entry_pk PRIMARY KEY(private_todo_entry_id)
);

CREATE TABLE todo (
    todo_id INTEGER NOT NULL AUTO_INCREMENT,
    group_id INTEGER NOT NULL,
    todo_text NVARCHAR(200) NOT NULL,
    datetime_deadline DATETIME,
    datetime_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    datetime_done DATETIME DEFAULT NULL,
    created_by_id INTEGER NOT NULL,
    done_by_id INTEGER,
    is_deactivated BIT NOT NULL DEFAULT 0,
    color_hex INTEGER,
    CONSTRAINT todo_group_fk FOREIGN KEY(group_id) REFERENCES home_group(group_id),
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

CREATE TABLE person_budget_entry (
    person_id INTEGER NOT NULL,
    budget_entry_id INTEGER NOT NULL,
    datetime_paid DATETIME,
    CONSTRAINT person_budget_entry_fk FOREIGN KEY(person_id) REFERENCES person(person_id),
    CONSTRAINT budget_entry_fk FOREIGN KEY(budget_entry_id) REFERENCES budget_entry(budget_entry_id),
    CONSTRAINT shopping_list_budget_entry_pk PRIMARY KEY(person_id, budget_entry_id)
);

INSERT INTO home_role(role_id, role_name) VALUES (1, 'Member');
INSERT INTO home_role(role_id, role_name) VALUES (2, 'Admin');

INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AED', 'UAE Dirham', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AFN', 'Afghani', '؋');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ALL', 'Lek', 'Lek');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AMD', 'Armenian Dram', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ANG', 'Netherlands Antillian Guilder', 'ƒ');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AOA', 'Kwanza', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ARS', 'Argentine Peso', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AUD', 'Australian Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AWG', 'Aruban Guilder', 'ƒ');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('AZN', 'Azerbaijanian Manat', 'ман');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BAM', 'Convertible Marks', 'KM');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BBD', 'Barbados Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BDT', 'Taka', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BGN', 'Bulgarian Lev', 'лв');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BHD', 'Bahraini Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BIF', 'Burundi Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BND', 'Brunei Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BOB', 'BOV Boliviano Mvdol', '$b');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BRL', 'Brazilian Real', 'R$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BSD', 'Bahamian Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BWP', 'Pula', 'P');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BYR', 'Belarussian Ruble', 'p.');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('BZD', 'Belize Dollar', 'BZ$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CAD', 'Canadian Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CDF', 'Congolese Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CHF', 'Swiss Franc', 'CHF');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CLP', 'CLF Chilean Peso Unidades de fomento', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign, currency_major) VALUES ('CNY', 'Yuan Renminbi', '¥', 1);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('COP', 'COU Colombian Peso Unidad de Valor Real', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CRC', 'Costa Rican Colon', '₡');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CUP', 'CUC Cuban Peso Peso Convertible', '₱');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CVE', 'Cape Verde Escudo', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('CZK', 'Czech Koruna', 'Kč');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('DJF', 'Djibouti Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('DKK', 'Danish Krone', 'kr');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('DOP', 'Dominican Peso', 'RD$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('DZD', 'Algerian Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('EEK', 'Kroon', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('EGP', 'Egyptian Pound', '£');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ERN', 'Nakfa', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ETB', 'Ethiopian Birr', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign, currency_major) VALUES ('EUR', 'Euro', '€', 1);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('FJD', 'Fiji Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('FKP', 'Falkland Islands Pound', '£');
INSERT INTO currency(currency_short, currency_long, currency_sign, currency_major) VALUES ('GBP', 'Pound Sterling', '£', 1);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GEL', 'Lari', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GHS', 'Cedi', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GIP', 'Gibraltar Pound', '£');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GMD', 'Dalasi', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GNF', 'Guinea Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GTQ', 'Quetzal', 'Q');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('GYD', 'Guyana Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('HKD', 'Hong Kong Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('HNL', 'Lempira', 'L');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('HRK', 'Croatian Kuna', 'kn');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('HTG', 'USD Gourde US Dollar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('HUF', 'Forint', 'Ft');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('IDR', 'Rupiah', 'Rp');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ILS', 'New Israeli Sheqel', '₪');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('INR', 'Indian Rupee', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('INR', 'BTN Indian Rupee Ngultrum', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('IQD', 'Iraqi Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('IRR', 'Iranian Rial', '﷼');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ISK', 'Iceland Krona', 'kr');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('JMD', 'Jamaican Dollar', 'J$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('JOD', 'Jordanian Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign, currency_major) VALUES ('JPY', 'Yen', '¥', 1);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KES', 'Kenyan Shilling', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KGS', 'Som', 'лв');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KHR', 'Riel', '៛');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KMF', 'Comoro Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KPW', 'North Korean Won', '₩');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KRW', 'Won', '₩');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KWD', 'Kuwaiti Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KYD', 'Cayman Islands Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('KZT', 'Tenge', 'лв');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LAK', 'Kip', '₭');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LBP', 'Lebanese Pound', '£');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LKR', 'Sri Lanka Rupee', '₨');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LRD', 'Liberian Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LTL', 'Lithuanian Litas', 'Lt');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LVL', 'Latvian Lats', 'Ls');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('LYD', 'Libyan Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MAD', 'Moroccan Dirham', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MDL', 'Moldovan Leu', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MGA', 'Malagasy Ariary', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MKD', 'Denar', 'ден');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MMK', 'Kyat', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MNT', 'Tugrik', '₮');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MOP', 'Pataca', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MRO', 'Ouguiya', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MUR', 'Mauritius Rupee', '₨');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MVR', 'Rufiyaa', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MWK', 'Kwacha', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MXN', 'MXV Mexican Peso Mexican Unidad de Inversion (UDI)', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MYR', 'Malaysian Ringgit', 'RM');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('MZN', 'Metical', 'MT');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('NGN', 'Naira', '₦');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('NIO', 'Cordoba Oro', 'C$');
INSERT INTO currency(currency_short, currency_long, currency_sign, currency_major) VALUES ('NOK', 'Norwegian Krone', 'kr', 1);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('NPR', 'Nepalese Rupee', '₨');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('NZD', 'New Zealand Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('OMR', 'Rial Omani', '﷼');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PAB', 'USD Balboa US Dollar', 'B/.');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PEN', 'Nuevo Sol', 'S/.');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PGK', 'Kina', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PHP', 'Philippine Peso', 'Php');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PKR', 'Pakistan Rupee', '₨');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PLN', 'Zloty', 'zł');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('PYG', 'Guarani', 'Gs');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('QAR', 'Qatari Rial', '﷼');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('RON', 'New Leu', 'lei');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('RSD', 'Serbian Dinar', 'Дин.');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('RUB', 'Russian Ruble', 'руб');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('RWF', 'Rwanda Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SAR', 'Saudi Riyal', '﷼');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SBD', 'Solomon Islands Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SCR', 'Seychelles Rupee', '₨');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SDG', 'Sudanese Pound', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SEK', 'Swedish Krona', 'kr');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SGD', 'Singapore Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SHP', 'Saint Helena Pound', '£');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SLL', 'Leone', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SOS', 'Somali Shilling', 'S');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SRD', 'Surinam Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('STD', 'Dobra', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SVC', 'USD El Salvador Colon US Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SYP', 'Syrian Pound', '£');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('SZL', 'Lilangeni', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('THB', 'Baht', '฿');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TJS', 'Somoni', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TMT', 'Manat', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TND', 'Tunisian Dinar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TOP', "Pa'anga", NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TRY', 'Turkish Lira', 'TL');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TTD', 'Trinidad and Tobago Dollar', 'TT$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TWD', 'New Taiwan Dollar', 'NT$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('TZS', 'Tanzanian Shilling', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('UAH', 'Hryvnia', '₴');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('UGX', 'Uganda Shilling', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign, currency_major) VALUES ('USD', 'US Dollar', '$', 1);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('UYU', 'UYI Peso Uruguayo Uruguay Peso en Unidades Indexadas', '$U');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('UZS', 'Uzbekistan Sum', 'лв');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('VEF', 'Bolivar Fuerte', 'Bs');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('VND', 'Dong', '₫');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('VUV', 'Vatu', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('WST', 'Tala', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XAF', 'CFA Franc BEAC', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XAG', 'Silver', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XAU', 'Gold', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XCD', 'East Caribbean Dollar', '$');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XDR', 'SDR', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XFU', 'UIC-Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XOF', 'CFA Franc BCEAO', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XPD', 'Palladium', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XPF', 'CFP Franc', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('XPT', 'Platinum', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('YER', 'Yemeni Rial', '﷼');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ZAR', 'Rand', 'R');
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ZAR', 'LSL Rand Loti', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ZAR', 'NAD Rand Namibia Dollar', NULL);
INSERT INTO currency(currency_short, currency_long, currency_sign) VALUES ('ZMK', 'Zambian Kwacha', NULL);

INSERT INTO shopping_list (shopping_list_name, currency_id) 
	VALUES ('', 100);

INSERT INTO shopping_list (shopping_list_name, currency_id) 
	VALUES ('', 100);

INSERT INTO shopping_list (shopping_list_name, currency_id) 
	VALUES ('', 100);

INSERT INTO shopping_list (shopping_list_name, currency_id) 
	VALUES ('test', 100);

INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) 
	VALUES ('test@test.com', 'testnavn', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'test', NULL, 'test', '23456', CURRENT_DATE, true, 0, NULL, DEFAULT, NULL, 1, DEFAULT);

INSERT INTO person (email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language, user_deactivated, facebook_api_id) 
	VALUES ('facebook@test.com', 'facebook', NULL, 'test', NULL, 'test', '', CURRENT_DATE, DEFAULT, DEFAULT, NULL, DEFAULT, NULL, 2, DEFAULT, DEFAULT, 123456);

INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) 
	VALUES ('test group', 'lol', DEFAULT, DEFAULT, NULL, DEFAULT, 100, 3);

INSERT INTO group_person (person_id, group_id, joined_timestamp, role_id, was_invited) 
	VALUES (1, 1, DEFAULT, 2, 0);

INSERT INTO group_person (person_id, group_id, joined_timestamp, role_id, was_invited) 
	VALUES (2, 1, DEFAULT, DEFAULT, 0);

INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) 
	VALUES (4, 1, true, CURRENT_DATE);

INSERT INTO todo (group_id, todo_text, created_by_id) VALUES (1, 'test task', 1);

INSERT INTO todo_person(person_id, todo_id) VALUES (1, 1);


INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 0', 76);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 1', 150);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 2', 67);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 3', 135);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 4', 107);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 5', 81);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 6', 6);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 7', 61);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 8', 71);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 9', 110);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 10', 88);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 11', 1);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 12', 24);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 13', 95);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 14', 71);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 15', 70);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 16', 8);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 17', 100);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 18', 65);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 19', 90);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 20', 123);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 21', 4);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 22', 32);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 23', 84);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 24', 109);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 25', 11);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 26', 114);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 27', 26);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 28', 3);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 29', 87);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 30', 61);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 31', 72);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 32', 102);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 33', 109);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 34', 7);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 35', 100);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 36', 128);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 37', 146);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 38', 145);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 39', 49);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 40', 76);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 41', 72);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 42', 22);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 43', 105);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 44', 48);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 45', 56);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 46', 79);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 47', 84);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 48', 5);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 49', 13);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 50', 100);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 51', 84);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 52', 136);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 53', 18);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 54', 83);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 55', 125);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 56', 53);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 57', 90);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 58', 83);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 59', 65);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 60', 77);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 61', 41);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 62', 2);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 63', 38);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 64', 119);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 65', 23);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 66', 79);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 67', 35);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 68', 73);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 69', 113);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 70', 144);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 71', 34);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 72', 90);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 73', 123);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 74', 47);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 75', 70);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 76', 43);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 77', 3);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 78', 34);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 79', 97);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 80', 99);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 81', 116);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 82', 12);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 83', 126);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 84', 85);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 85', 80);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 86', 148);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 87', 87);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 88', 12);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 89', 15);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 90', 86);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 91', 77);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 92', 85);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 93', 150);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 94', 132);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 95', 70);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 96', 41);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 97', 110);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 98', 87);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 99', 128);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human0@Earth.com', 'Human 0', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 0', NULL, 'Human 0', '17784438', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 4, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human1@Earth.com', 'Human 1', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 1', NULL, 'Human 1', '81522391', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 5, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human2@Earth.com', 'Human 2', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 2', NULL, 'Human 2', '57762051', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 6, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human3@Earth.com', 'Human 3', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 3', NULL, 'Human 3', '89165415', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 7, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human4@Earth.com', 'Human 4', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 4', NULL, 'Human 4', '12130022', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 8, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human5@Earth.com', 'Human 5', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 5', NULL, 'Human 5', '20060820', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 9, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human6@Earth.com', 'Human 6', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 6', NULL, 'Human 6', '63100498', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 10, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human7@Earth.com', 'Human 7', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 7', NULL, 'Human 7', '15499683', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 11, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human8@Earth.com', 'Human 8', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 8', NULL, 'Human 8', '10298907', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 12, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human9@Earth.com', 'Human 9', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 9', NULL, 'Human 9', '42690504', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 13, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human10@Earth.com', 'Human 10', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 10', NULL, 'Human 10', '99722959', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 14, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human11@Earth.com', 'Human 11', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 11', NULL, 'Human 11', '13879210', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 15, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human12@Earth.com', 'Human 12', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 12', NULL, 'Human 12', '82413793', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 16, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human13@Earth.com', 'Human 13', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 13', NULL, 'Human 13', '64561580', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 17, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human14@Earth.com', 'Human 14', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 14', NULL, 'Human 14', '55688851', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 18, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human15@Earth.com', 'Human 15', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 15', NULL, 'Human 15', '34688739', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 19, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human16@Earth.com', 'Human 16', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 16', NULL, 'Human 16', '75842624', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 20, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human17@Earth.com', 'Human 17', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 17', NULL, 'Human 17', '21565812', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 21, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human18@Earth.com', 'Human 18', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 18', NULL, 'Human 18', '59184932', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 22, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human19@Earth.com', 'Human 19', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 19', NULL, 'Human 19', '88182504', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 23, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human20@Earth.com', 'Human 20', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 20', NULL, 'Human 20', '96707283', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 24, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human21@Earth.com', 'Human 21', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 21', NULL, 'Human 21', '46344300', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 25, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human22@Earth.com', 'Human 22', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 22', NULL, 'Human 22', '83417083', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 26, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human23@Earth.com', 'Human 23', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 23', NULL, 'Human 23', '56744567', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 27, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human24@Earth.com', 'Human 24', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 24', NULL, 'Human 24', '83277434', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 28, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human25@Earth.com', 'Human 25', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 25', NULL, 'Human 25', '92590552', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 29, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human26@Earth.com', 'Human 26', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 26', NULL, 'Human 26', '23143378', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 30, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human27@Earth.com', 'Human 27', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 27', NULL, 'Human 27', '64237884', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 31, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human28@Earth.com', 'Human 28', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 28', NULL, 'Human 28', '96485057', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 32, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human29@Earth.com', 'Human 29', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 29', NULL, 'Human 29', '49229939', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 33, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human30@Earth.com', 'Human 30', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 30', NULL, 'Human 30', '56419551', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 34, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human31@Earth.com', 'Human 31', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 31', NULL, 'Human 31', '58971264', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 35, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human32@Earth.com', 'Human 32', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 32', NULL, 'Human 32', '28013220', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 36, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human33@Earth.com', 'Human 33', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 33', NULL, 'Human 33', '90816352', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 37, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human34@Earth.com', 'Human 34', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 34', NULL, 'Human 34', '92316641', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 38, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human35@Earth.com', 'Human 35', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 35', NULL, 'Human 35', '72935323', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 39, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human36@Earth.com', 'Human 36', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 36', NULL, 'Human 36', '42149334', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 40, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human37@Earth.com', 'Human 37', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 37', NULL, 'Human 37', '88357400', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 41, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human38@Earth.com', 'Human 38', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 38', NULL, 'Human 38', '24750259', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 42, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human39@Earth.com', 'Human 39', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 39', NULL, 'Human 39', '69237610', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 43, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human40@Earth.com', 'Human 40', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 40', NULL, 'Human 40', '97891301', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 44, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human41@Earth.com', 'Human 41', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 41', NULL, 'Human 41', '56437949', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 45, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human42@Earth.com', 'Human 42', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 42', NULL, 'Human 42', '59074347', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 46, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human43@Earth.com', 'Human 43', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 43', NULL, 'Human 43', '46137009', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 47, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human44@Earth.com', 'Human 44', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 44', NULL, 'Human 44', '49133961', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 48, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human45@Earth.com', 'Human 45', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 45', NULL, 'Human 45', '22537747', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 49, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human46@Earth.com', 'Human 46', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 46', NULL, 'Human 46', '71163755', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 50, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human47@Earth.com', 'Human 47', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 47', NULL, 'Human 47', '51730461', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 51, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human48@Earth.com', 'Human 48', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 48', NULL, 'Human 48', '51374465', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 52, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human49@Earth.com', 'Human 49', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 49', NULL, 'Human 49', '45449747', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 53, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human50@Earth.com', 'Human 50', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 50', NULL, 'Human 50', '90911206', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 54, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human51@Earth.com', 'Human 51', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 51', NULL, 'Human 51', '75074082', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 55, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human52@Earth.com', 'Human 52', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 52', NULL, 'Human 52', '55367504', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 56, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human53@Earth.com', 'Human 53', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 53', NULL, 'Human 53', '41814485', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 57, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human54@Earth.com', 'Human 54', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 54', NULL, 'Human 54', '37158491', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 58, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human55@Earth.com', 'Human 55', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 55', NULL, 'Human 55', '79909473', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 59, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human56@Earth.com', 'Human 56', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 56', NULL, 'Human 56', '66366315', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 60, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human57@Earth.com', 'Human 57', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 57', NULL, 'Human 57', '12401366', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 61, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human58@Earth.com', 'Human 58', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 58', NULL, 'Human 58', '49893506', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 62, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human59@Earth.com', 'Human 59', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 59', NULL, 'Human 59', '28105962', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 63, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human60@Earth.com', 'Human 60', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 60', NULL, 'Human 60', '29360783', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 64, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human61@Earth.com', 'Human 61', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 61', NULL, 'Human 61', '90214762', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 65, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human62@Earth.com', 'Human 62', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 62', NULL, 'Human 62', '18478899', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 66, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human63@Earth.com', 'Human 63', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 63', NULL, 'Human 63', '24875272', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 67, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human64@Earth.com', 'Human 64', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 64', NULL, 'Human 64', '32543351', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 68, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human65@Earth.com', 'Human 65', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 65', NULL, 'Human 65', '51670597', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 69, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human66@Earth.com', 'Human 66', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 66', NULL, 'Human 66', '66020215', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 70, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human67@Earth.com', 'Human 67', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 67', NULL, 'Human 67', '25446079', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 71, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human68@Earth.com', 'Human 68', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 68', NULL, 'Human 68', '38279780', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 72, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human69@Earth.com', 'Human 69', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 69', NULL, 'Human 69', '15028146', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 73, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human70@Earth.com', 'Human 70', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 70', NULL, 'Human 70', '97851844', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 74, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human71@Earth.com', 'Human 71', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 71', NULL, 'Human 71', '70539245', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 75, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human72@Earth.com', 'Human 72', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 72', NULL, 'Human 72', '10318424', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 76, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human73@Earth.com', 'Human 73', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 73', NULL, 'Human 73', '42583703', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 77, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human74@Earth.com', 'Human 74', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 74', NULL, 'Human 74', '74319373', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 78, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human75@Earth.com', 'Human 75', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 75', NULL, 'Human 75', '23317889', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 79, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human76@Earth.com', 'Human 76', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 76', NULL, 'Human 76', '55492751', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 80, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human77@Earth.com', 'Human 77', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 77', NULL, 'Human 77', '27891713', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 81, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human78@Earth.com', 'Human 78', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 78', NULL, 'Human 78', '51281356', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 82, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human79@Earth.com', 'Human 79', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 79', NULL, 'Human 79', '14650531', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 83, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human80@Earth.com', 'Human 80', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 80', NULL, 'Human 80', '39472933', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 84, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human81@Earth.com', 'Human 81', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 81', NULL, 'Human 81', '16670648', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 85, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human82@Earth.com', 'Human 82', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 82', NULL, 'Human 82', '74878904', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 86, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human83@Earth.com', 'Human 83', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 83', NULL, 'Human 83', '16168841', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 87, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human84@Earth.com', 'Human 84', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 84', NULL, 'Human 84', '66024663', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 88, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human85@Earth.com', 'Human 85', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 85', NULL, 'Human 85', '84151887', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 89, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human86@Earth.com', 'Human 86', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 86', NULL, 'Human 86', '21132200', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 90, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human87@Earth.com', 'Human 87', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 87', NULL, 'Human 87', '97348257', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 91, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human88@Earth.com', 'Human 88', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 88', NULL, 'Human 88', '36066427', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 92, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human89@Earth.com', 'Human 89', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 89', NULL, 'Human 89', '49762434', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 93, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human90@Earth.com', 'Human 90', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 90', NULL, 'Human 90', '34303422', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 94, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human91@Earth.com', 'Human 91', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 91', NULL, 'Human 91', '14744520', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 95, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human92@Earth.com', 'Human 92', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 92', NULL, 'Human 92', '73466841', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 96, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human93@Earth.com', 'Human 93', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 93', NULL, 'Human 93', '10566948', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 97, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human94@Earth.com', 'Human 94', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 94', NULL, 'Human 94', '87407748', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 98, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human95@Earth.com', 'Human 95', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 95', NULL, 'Human 95', '11838782', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 99, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human96@Earth.com', 'Human 96', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 96', NULL, 'Human 96', '22948142', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 100, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human97@Earth.com', 'Human 97', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 97', NULL, 'Human 97', '48165494', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 101, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human98@Earth.com', 'Human 98', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 98', NULL, 'Human 98', '40146445', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 102, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human99@Earth.com', 'Human 99', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human 99', NULL, 'Human 99', '76860533', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 103, DEFAULT);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 0', 49);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 1', 87);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 2', 36);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 3', 78);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 4', 70);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 5', 72);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 6', 50);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 7', 142);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 8', 105);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 9', 41);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 10', 44);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 11', 138);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 12', 103);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 13', 113);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 14', 22);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 0', 119);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 1', 96);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 2', 103);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 3', 31);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 4', 106);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 5', 55);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 6', 71);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 7', 35);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 8', 26);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 9', 109);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 10', 119);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 11', 141);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 12', 143);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 13', 120);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 14', 134);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 15', 95);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 16', 37);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 17', 23);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 18', 120);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 19', 149);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 0', 'Group 0', DEFAULT, DEFAULT, NULL, DEFAULT, 138, 104);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 1', 'Group 1', DEFAULT, DEFAULT, NULL, DEFAULT, 53, 105);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 2', 'Group 2', DEFAULT, DEFAULT, NULL, DEFAULT, 135, 106);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 3', 'Group 3', DEFAULT, DEFAULT, NULL, DEFAULT, 27, 107);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 4', 'Group 4', DEFAULT, DEFAULT, NULL, DEFAULT, 17, 108);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 5', 'Group 5', DEFAULT, DEFAULT, NULL, DEFAULT, 77, 109);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 6', 'Group 6', DEFAULT, DEFAULT, NULL, DEFAULT, 109, 110);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 7', 'Group 7', DEFAULT, DEFAULT, NULL, DEFAULT, 114, 111);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 8', 'Group 8', DEFAULT, DEFAULT, NULL, DEFAULT, 106, 112);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 9', 'Group 9', DEFAULT, DEFAULT, NULL, DEFAULT, 137, 113);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 10', 'Group 10', DEFAULT, DEFAULT, NULL, DEFAULT, 66, 114);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 11', 'Group 11', DEFAULT, DEFAULT, NULL, DEFAULT, 119, 115);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 12', 'Group 12', DEFAULT, DEFAULT, NULL, DEFAULT, 52, 116);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 13', 'Group 13', DEFAULT, DEFAULT, NULL, DEFAULT, 117, 117);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 14', 'Group 14', DEFAULT, DEFAULT, NULL, DEFAULT, 37, 118);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 15', 'Group 15', DEFAULT, DEFAULT, NULL, DEFAULT, 125, 119);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 16', 'Group 16', DEFAULT, DEFAULT, NULL, DEFAULT, 50, 120);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 17', 'Group 17', DEFAULT, DEFAULT, NULL, DEFAULT, 60, 121);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 18', 'Group 18', DEFAULT, DEFAULT, NULL, DEFAULT, 29, 122);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) VALUES ('Group 19', 'Group 19', DEFAULT, DEFAULT, NULL, DEFAULT, 119, 123);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (84, 2, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (20, 3, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (95, 13, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (54, 9, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (37, 3, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (23, 12, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (55, 21, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (89, 8, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (33, 9, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (64, 8, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (22, 20, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (16, 8, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (85, 13, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (44, 7, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (25, 18, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (78, 14, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (98, 18, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (14, 4, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (7, 20, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (88, 4, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (28, 13, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (92, 3, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (30, 3, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (18, 14, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (80, 4, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (76, 18, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (100, 10, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (52, 15, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (43, 16, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (91, 7, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (69, 21, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (99, 11, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (65, 5, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (60, 3, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (72, 3, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (47, 21, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (9, 13, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (71, 14, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (58, 14, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (39, 21, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (97, 6, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (62, 17, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (27, 15, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (40, 15, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (34, 18, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (4, 18, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (10, 12, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (26, 8, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (41, 4, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (83, 17, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (101, 13, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (86, 17, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (42, 16, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (51, 4, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (48, 8, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (38, 4, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (12, 20, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (73, 4, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (59, 8, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (94, 2, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (57, 14, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (74, 6, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (19, 21, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (29, 8, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (66, 2, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (5, 8, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (21, 12, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (77, 14, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (68, 3, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (56, 2, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (6, 9, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (82, 17, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (13, 2, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (75, 7, 2, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (8, 21, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (61, 10, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (17, 11, 2, False);
