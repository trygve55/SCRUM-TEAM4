from random import *
import random
from pathlib import Path

fileName = "random.sql";

def writeFile(file, data):
        file = open(file, "a");
        file.write(data + "\n");

lists = 15;
currencies = 150;
people = 100;
groups = 20;

currentLists = 4;
currentPeople = 2;
currentGroups = 2;

names = [];
for i in range(0, people):
	names.append("Human " + str(i));

for i in range(0, people):
	query = "INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList " + str(i) +"', "+ str(randint(1, currencies)) +");";
	
	writeFile(fileName, query);

for i in range(0, people):
	query = ("INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, is_verified, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) " 
	+"VALUES ('Human" + str(i) + "@Earth.com', '"+ names[i] +"', x'243261243130244c6b3943524f466835467471577158506756766c772e586b473269397a653473336d5a667a6a502e545131545162793945676b3647',"
	+" '"+ names[i] +"', NULL, '"+ names[i] +"', '"+ str(randint(10000000, 99999999)) +"', CURRENT_DATE,"
	+" "+ str(bool(randint(0, 1))) +", 0, NULL, DEFAULT, NULL, "+ str(currentLists + i) +", DEFAULT);");
	
	writeFile(fileName, query);

for i in range(0, lists):
	query = ("INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('List " + str(i) +"', "+ str(randint(1, currencies)) +");");
	
	writeFile(fileName, query);

for i in range(0, groups):
	query = ("INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('GList " + str(i) +"', "+ str(randint(1, currencies)) +");");
	
	writeFile(fileName, query);

groupNames = [];
for i in range(0, groups):
	groupNames.append("Group " + str(i));

for i in range(0, groups):
	query = ("INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, cleaning_list_interval, default_currency_id, shopping_list_id) " 
	+"VALUES ('"+ groupNames[i] +"', '"+ groupNames[i] +"', DEFAULT, DEFAULT, NULL, DEFAULT, "+ str(randint(1, currencies)) +", "+ str(i + people + currentLists) +");");
	
	writeFile(fileName, query);

uniqueIDs = sample(range(currentPeople, people + currentPeople), int(people/5) * 4);

for i in uniqueIDs:
	query = ("INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES ("+ str(i) +", "+ str(randint(currentGroups, groups + currentGroups)) +", "+ str(randint(1, 2)) +", "+ str(bool(randint(0, 1))) +");");
	
	writeFile(fileName, query);

uniqueIDs = sample(range(currentPeople, people + currentPeople), people);

for i in uniqueIDs:
	query = ("INSERT INTO shopping_list_person (shopping_list_id, person_id, paid_amount, invite_accepted, invite_sent_datetime) "
	+"VALUES ("+ str(randint(currentLists, lists + currentLists)) +", "+ str(i) +", "+ str(randint(0, 100000)) +", "+ str(bool(randint(0, 1))) +", CURRENT_DATE);")
	
	writeFile(fileName, query);

print("New data created in: " + fileName);
