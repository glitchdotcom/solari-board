#!C:\Python27\python.exe 
# -*- coding: UTF-8 -*-

from fogbugz import FogBugz
from datetime import datetime, timedelta
import fbsettings
import urllib2, cgi, sys, os, string, io, json, time, random
import cgitb

fb = FogBugz(fbsettings.URL, fbsettings.TOKEN)
resp = fb.search(q='project:inbox area:* status:active due:today orderby:due',cols="dtDue,sTitle,sStatus")

myList = [];

for case in resp.cases:
	date = datetime.strptime(case.dtdue.string, '%Y-%m-%dT%H:%M:%SZ').strftime('%m/%d/%Y')
	time = str(case.dtdue.string[11:16])
	departure = case.stitle.string.encode('UTF-8').replace('\"', '')
	if int((datetime.strptime(case.dtdue.string, '%Y-%m-%dT%H:%M:%SZ') - datetime.now()).days) < 0: 
		status = 3 
	else: 
		status = 2	
	track =  random.randrange(0,100)
	myList.append({'sDate': date ,'sTime':time,'sDeparture':departure,'nStatus': 2,'nTrack':track, 'bLight':False})

#turn on the top light
try:
	myList[0]['bLight'] = True;
except:
	pass 

print "Content-Type: application/json"
print 
print json.dumps(myList)