INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language)
	VALUES ('mail@example.com', 'demo', x'$2a$10$YpC8y4SbkZ7YT6fTyyA9F.BvDmwpmSEkPYSAyZGH4bmT2CxQlxQ6q', 'Ola', NULL, 'Normann', '12345678', '1990-01-01', true, 0, NULL, DEFAULT, NULL, 1, DEFAULT);

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

INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 0', 123);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 1', 78);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 2', 100);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 3', 66);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 4', 97);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 5', 143);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 6', 25);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 7', 14);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 8', 72);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList 9', 59);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Sarah@Madsen.com', 'Sarah_Madsen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Sarah', NULL, 'Madsen', '59590192', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 4, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Noah@Isaksen.com', 'Noah_Isaksen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Noah', NULL, 'Isaksen', '64340691', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 5, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Isaac@Hansen.com', 'Isaac_Hansen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Isaac', NULL, 'Hansen', '38711199', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 6, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('William@Gulbrandsen.com', 'William_Gulbrandsen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'William', NULL, 'Gulbrandsen', '86144589', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 7, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Lucas@Amundsen.com', 'Lucas_Amundsen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Lucas', NULL, 'Amundsen', '72626506', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 8, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Filip@Larsen.com', 'Filip_Larsen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Filip', NULL, 'Larsen', '11420254', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 9, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Oskar@Lie.com', 'Oskar_Lie', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Oskar', NULL, 'Lie', '79146201', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 10, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Jakob@Pedersen.com', 'Jakob_Pedersen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Jakob', NULL, 'Pedersen', '38456496', CURRENT_DATE, True, 0, NULL, DEFAULT, NULL, 11, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Sahra@Myhre.com', 'Sahra_Myhre', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Sahra', NULL, 'Myhre', '81454640', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 12, DEFAULT);
INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) VALUES ('Maja@Tangen.com', 'Maja_Tangen', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647', 'Maja', NULL, 'Tangen', '14520159', CURRENT_DATE, False, 0, NULL, DEFAULT, NULL, 13, DEFAULT);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 0', 83);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 1', 97);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 2', 115);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 3', 124);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 4', 20);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 5', 69);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 6', 148);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 7', 44);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 8', 11);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 9', 28);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 10', 60);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 11', 80);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 12', 49);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 13', 3);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List 14', 34);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 0', 109);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 1', 65);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 2', 19);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 3', 18);
INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList 4', 37);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 0', 'Group 0', DEFAULT, DEFAULT, NULL, 113, 14);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 1', 'Group 1', DEFAULT, DEFAULT, NULL, 43, 15);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 2', 'Group 2', DEFAULT, DEFAULT, NULL, 23, 16);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 3', 'Group 3', DEFAULT, DEFAULT, NULL, 88, 17);
INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) VALUES ('Group 4', 'Group 4', DEFAULT, DEFAULT, NULL, 100, 18);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (5, 6, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (7, 5, 1, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (8, 2, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (4, 6, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (6, 5, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (9, 2, 1, False);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (3, 4, 2, True);
INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES (11, 6, 1, False);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (9, 11, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (12, 7, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (14, 4, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (19, 5, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (14, 6, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (9, 3, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (13, 8, True, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (13, 10, False, CURRENT_DATE);
INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) VALUES (8, 9, True, CURRENT_DATE);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 0', 11, 7, 629);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 1', 6, 8, 446);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 2', 9, 4, 4147);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 3', 4, 12, 2225);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (15, 'Thing 4', 4, 12, 3949);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (8, 'Thing 5', 4, 12, 1304);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (7, 'Thing 6', 11, 5, 2726);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 7', 4, 6, 1492);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (6, 'Thing 8', 9, 9, 1300);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 9', 11, 8, 0);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 10', 7, 3, 816);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (8, 'Thing 11', 12, 5, 2061);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (6, 'Thing 12', 11, 3, 1376);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 13', 11, 5, 1328);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (15, 'Thing 14', 8, 4, 3119);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 15', 5, 9, 1786);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 16', 6, 7, 2464);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 17', 11, 12, 68);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 18', 9, 4, 1320);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 19', 7, 3, 1572);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 20', 12, 12, 1771);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 21', 8, 10, 3061);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (7, 'Thing 22', 5, 7, 1124);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 23', 12, 9, 3135);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 24', 4, 3, 635);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 25', 7, 3, 2958);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 26', 11, 6, 242);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 27', 9, 3, 746);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (9, 'Thing 28', 10, 11, 2062);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (15, 'Thing 29', 10, 11, 2612);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 30', 4, 4, 2197);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (9, 'Thing 31', 10, 6, 3662);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (7, 'Thing 32', 11, 5, 1365);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 33', 8, 10, 807);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 34', 10, 9, 2184);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 35', 9, 10, 2337);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (11, 'Thing 36', 9, 12, 3364);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (6, 'Thing 37', 12, 11, 3504);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 38', 3, 4, 2198);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 39', 9, 7, 3252);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 40', 11, 12, 2196);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 41', 12, 10, 344);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 42', 8, 6, 2614);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (7, 'Thing 43', 8, 6, 4090);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 44', 8, 7, 2728);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 45', 11, 6, 3838);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 46', 7, 7, 1015);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 47', 7, 10, 531);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (12, 'Thing 48', 12, 7, 2858);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 49', 11, 7, 2100);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 50', 5, 8, 1427);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (17, 'Thing 51', 11, 4, 2472);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (19, 'Thing 52', 12, 4, 145);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (14, 'Thing 53', 5, 4, 1032);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (7, 'Thing 54', 11, 3, 3463);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (5, 'Thing 55', 6, 4, 2233);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (10, 'Thing 56', 9, 7, 376);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (13, 'Thing 57', 8, 5, 2613);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (18, 'Thing 58', 10, 6, 3336);
INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) VALUES (15, 'Thing 59', 6, 11, 1449);