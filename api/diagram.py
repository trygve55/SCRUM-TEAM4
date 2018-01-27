from pathlib import Path
import os
import os.path
import re
import sys

def writeFile(file, data):
	file = open(file, "a");
	file.write(data);
	file.write("\n");

#(URL:\s*[{/a-z_A-Z}]*)((?:([a-zA-Z*():]|\s)*)(\{\s*(\*.*[a-zA-Z]+.*\s*)*\*\s*\}))?
#(URL:\s*[{/a-z_A-Z}]*)((?:([a-zA-Z*():]|\s)*)(?:data\s*:\s*)\{[)(\]\[\w\,\s_*"\-\.]*\})?
regExp = re.compile(r'''(router\.[a-zA-Z/'():_-]*',)''');
regExp2 = re.compile(r'''(URL:\s*[{/a-z_A-Z}]*)((?:([a-zA-Z*():]|\s)*)(?:data\s*:\s*)\{[)(\]\[\w\,\s_*"\-\.]*\})?''');
files = [f for f in os.listdir('.') if os.path.isfile(f)];

for i in files:
	if (i != "diagram.py") and (i != "data.txt") :
		try:
			with open(i, 'r') as f:
				writeFile("data.txt", i);
				#print(i);
				data = f.read().replace('\n', ' ');
				match = regExp.findall(data);
				if (match):
					for m0 in match:
						#print(m0.replace("router.", "").replace("'", "").replace(",", ""));
						writeFile("data.txt", m0.replace("router.", "").replace("'", "").replace(",", ""));
				match2 = regExp2.findall(data);
				#print(match2);
				if (match2):
					for m1 in match2:
						#print(" ".join(("".join(m1)).split()).replace("data:", "").replace("*", ""));
						writeFile("data.txt", " ".join(("".join(m1)).split()).replace("data:", "").replace("*", ""));
				writeFile("data.txt", "----------");
		except:
			print("Exception at file " + i, sys.exc_info()[0]);
	#sys.exit();