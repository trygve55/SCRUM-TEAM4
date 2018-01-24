from random import *
import random
from pathlib import Path

fileName = "random.sql";

def writeFile(file, data):
        file = open(file, "a");
        file.write(data + "\n");

lists = 15;
currencies = 150;
people = 10;
groups = 5;
shoppingItems = 60;

currentLists = 4;
currentPeople = 2;
currentGroups = 1;
currentShoppingItems = 0;

names = [];
for i in range(0, people):
	names.append("Human_" + str(i));

for i in range(0, people):
	query = "INSERT INTO shopping_list (shopping_list_name, currency_id) VALUES ('PList " + str(i) +"', "+ str(randint(1, currencies)) +");";
	
	writeFile(fileName, query);

for i in range(0, people):
	query = ("INSERT INTO person(email, username, password_hash, forename, middlename, lastname, phone, birth_date, verify_token, gender, profile_pic, last_active, reset_password_token, shopping_list_id, user_language) " 
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
	query = ("INSERT INTO home_group (group_name, group_desc, group_type, created_datetime, group_pic, default_currency_id, shopping_list_id) " 
	+"VALUES ('"+ groupNames[i] +"', '"+ groupNames[i] +"', DEFAULT, DEFAULT, NULL, "+ str(randint(1, currencies)) +", "+ str(i + people + currentLists) +");");
	
	writeFile(fileName, query);

uniqueIDs = sample(range(currentPeople + 1, people + currentPeople), int(people/5) * 4);

for i in uniqueIDs:
	query = ("INSERT INTO group_person (person_id, group_id, role_id, was_invited) VALUES ("+ str(i) +", "+ str(randint(currentGroups + 1, groups + currentGroups)) +", "+ str(randint(1, 2)) +", "+ str(bool(randint(0, 1))) +");");
	
	writeFile(fileName, query);

uniqueIDs = sample(range(currentPeople + 1, people + currentPeople), people);

for i in uniqueIDs:
	query = ("INSERT INTO shopping_list_person (shopping_list_id, person_id, invite_accepted, invite_sent_datetime) "
	+"VALUES ("+ str(randint(currentLists + 1, lists + currentLists)) +", "+ str(i) +", "+ str(bool(randint(0, 1))) +", CURRENT_DATE);")
	
	writeFile(fileName, query);

for i in range(0, shoppingItems):
        query = ("INSERT INTO shopping_list_entry (shopping_list_id, entry_text, added_by_person_id, purchased_by_person_id, cost) "
	+ "VALUES ("+ str(randint(currentLists + 1, lists + currentLists)) +", 'Thing "+ str(i) +"', "+ str(randint(currentPeople + 1, people + currentPeople)) +", "+ str(randint(currentPeople + 1, people + currentPeople)) +", "+ str(randint(0, 4200)) +");");

        writeFile(fileName, query);
        
print("SQL queries created in: " + fileName + ":\nShoppingLists: " + str(lists) + "\nUsers: " + str(people) + "\nGroups: " + str(groups) + "\nShoppingListItems: " + str(shoppingItems));
