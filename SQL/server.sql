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
    gender INTEGER NOT NULL DEFAULT 0,
    profile_pic BLOB,
    last_active TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reset_password_token VARCHAR(255),
    shopping_list_id INTEGER NOT NULL,
    user_language VARCHAR(5) NOT NULL DEFAULT 'nb_NO',
    user_deactivated BIT NOT NULL DEFAULT 0,
    facebook_api_id BIGINT,
    CONSTRAINT person_pk PRIMARY KEY(person_id)
);

CREATE TABLE home_group ( 
    group_id INTEGER NOT NULL AUTO_INCREMENT,
    group_name NVARCHAR(50) NOT NULL,
    group_desc NVARCHAR(200),
    group_type INTEGER NOT NULL DEFAULT 0,
    created_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_pic BLOB,
    cleaning_list_inerval INTEGER NOT NULL DEFAULT 0,
    default_currency_id INTEGER NOT NULL,
    shopping_list_id INTEGER NOT NULL,
    CONSTRAINT group_currency_fk FOREIGN KEY(default_currency_id) REFERENCES currency(currency_id),
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
    shopping_list_entry_id INTEGER NOT NULL AUTO_INCREMENT,
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

INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) 
	VALUES ('test@test.com', 'testnavn', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'test', NULL, 'test', '23456', CURRENT_DATE, true, 0, NULL, DEFAULT, NULL, 0, DEFAULT);

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

