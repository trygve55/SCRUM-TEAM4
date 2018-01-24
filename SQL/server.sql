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
    verify_token VARCHAR(255),
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
    autogen_id INTEGER,
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

INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) 
	VALUES ('test@test.com', 'testnavn', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'test', NULL, 'test', '23456', CURRENT_DATE, true, 0, NULL, DEFAULT, NULL, 1, DEFAULT);

INSERT INTO person (email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language, user_deactivated, facebook_api_id) 
	VALUES ('facebook@test.com', 'facebook', NULL, 'test', NULL, 'test', '', CURRENT_DATE, DEFAULT, DEFAULT, NULL, DEFAULT, NULL, 2, DEFAULT, DEFAULT, 123456);

INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) 
	VALUES ('test group', 'lol', DEFAULT, DEFAULT, NULL, 100, 3);

INSERT INTO group_person (person_id, group_id, joined_timestamp, role_id, was_invited) 
	VALUES (1, 1, DEFAULT, 2, 0);

INSERT INTO group_person (person_id, group_id, joined_timestamp, role_id, was_invited) 
	VALUES (2, 1, DEFAULT, DEFAULT, 0);

INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) 
	VALUES (4, 1, true, CURRENT_DATE);

INSERT INTO todo (group_id, todo_text, created_by_id) VALUES (1, 'test task', 1);

INSERT INTO todo_person(person_id, todo_id) VALUES (1, 1);


INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 0', 92);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 1', 89);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 2', 100);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 3', 78);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 4', 73);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 5', 70);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 6', 142);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 7', 57);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 8', 57);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 9', 76);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human0@Earth.com', 'Human_0', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_0', NULL, 'Human_0', '79455568', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 4, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human1@Earth.com', 'Human_1', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_1', NULL, 'Human_1', '75747726', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 5, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human2@Earth.com', 'Human_2', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_2', NULL, 'Human_2', '61189153', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 6, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human3@Earth.com', 'Human_3', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_3', NULL, 'Human_3', '91384068', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 7, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human4@Earth.com', 'Human_4', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_4', NULL, 'Human_4', '90018754', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 8, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human5@Earth.com', 'Human_5', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_5', NULL, 'Human_5', '56525849', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 9, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human6@Earth.com', 'Human_6', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_6', NULL, 'Human_6', '93153084', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 10, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human7@Earth.com', 'Human_7', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_7', NULL, 'Human_7', '80489451', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 11, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human8@Earth.com', 'Human_8', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_8', NULL, 'Human_8', '46230672', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 12, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Human9@Earth.com', 'Human_9', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Human_9', NULL, 'Human_9', '34811941', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 13, DEFAULT);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 0', 82);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 1', 16);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 2', 77);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 3', 126);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 4', 132);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 5', 79);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 6', 150);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 7', 104);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 8', 30);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 9', 131);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 10', 118);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 11', 45);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 12', 30);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 13', 130);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 14', 131);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 0', 32);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 1', 75);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 2', 85);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 3', 85);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 4', 40);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 0', 'Group 0', DEFAULT, DEFAULT, NULL, 119, 14);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 1', 'Group 1', DEFAULT, DEFAULT, NULL, 13, 15);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 2', 'Group 2', DEFAULT, DEFAULT, NULL, 54, 16);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 3', 'Group 3', DEFAULT, DEFAULT, NULL, 122, 17);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 4', 'Group 4', DEFAULT, DEFAULT, NULL, 132, 18);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (4, 1, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (6, 4, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (7, 2, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (8, 4, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (3, 1, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (5, 3, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (9, 3, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (10, 6, 2, False);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (8, 9, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (8, 10, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (5, 6, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (6, 11, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (7, 8, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (19, 4, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (15, 5, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (7, 7, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (9, 2, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (13, 3, False, CURRENT_DATE);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 0', 8, 12, 125);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (6, 'Thing 1', 3, 11, 560);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (6, 'Thing 2', 10, 5, 1468);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 3', 10, 9, 3864);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 4', 9, 5, 1177);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (9, 'Thing 5', 5, 6, 2685);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (16, 'Thing 6', 4, 12, 2381);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (7, 'Thing 7', 5, 8, 2695);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (16, 'Thing 8', 9, 10, 956);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 9', 12, 10, 1518);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 10', 3, 8, 2295);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 11', 5, 4, 2188);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 12', 3, 10, 298);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 13', 12, 3, 2805);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 14', 4, 2, 1215);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (9, 'Thing 15', 3, 12, 3713);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (4, 'Thing 16', 6, 5, 3429);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 17', 6, 12, 4029);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 18', 12, 9, 3452);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 19', 2, 6, 2497);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 20', 5, 12, 842);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 21', 8, 4, 9);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 22', 8, 10, 3141);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (8, 'Thing 23', 6, 9, 4106);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (8, 'Thing 24', 9, 6, 3728);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 25', 4, 6, 3442);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 26', 8, 3, 1556);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 27', 8, 4, 3260);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 28', 10, 5, 1640);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 29', 8, 3, 4121);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 30', 5, 10, 2192);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 31', 9, 8, 3550);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 32', 8, 5, 779);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 33', 12, 6, 1667);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (9, 'Thing 34', 7, 7, 3790);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (15, 'Thing 35', 7, 11, 3505);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 36', 3, 2, 434);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 37', 11, 7, 2129);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 38', 6, 7, 1358);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 39', 5, 2, 2540);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 40', 2, 7, 157);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 41', 2, 2, 1599);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 42', 8, 9, 3771);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 43', 7, 12, 2214);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 44', 3, 4, 2277);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 45', 6, 12, 273);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (4, 'Thing 46', 5, 9, 3757);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 47', 8, 11, 3689);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 48', 10, 2, 1733);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 49', 6, 6, 3993);
