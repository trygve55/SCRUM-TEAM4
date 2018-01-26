from pathlib import Path
import os
import os.path
import re

def writeFile(file, data):
	file = open(file, "a");
	file.write(data);
	file.write("\n");

regExp = re.compile("(.*router\..*')");
regExp2 = re.compile("(\*)(\s*    )([a-zA-Z][a-zA-Z]*)");
files = [f for f in os.listdir('.') if os.path.isfile(f)];

for i in files:
	if (i != "diagram.py") :
		try:
			with open(i, 'r') as f:
				writeFile("data.txt", i);
				for j in f.readlines():
					match = regExp.findall(j);
					if (match):
						writeFile("data.txt", match[0].replace("router.", "").replace("'", ""));
		except Exception:
			print("Exception at file " + i);