#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import json
import random
from datetime import datetime

import fbsettings
from fogbugz import FogBugz


def cgi():
    fb = FogBugz(fbsettings.URL, fbsettings.TOKEN)
    resp = fb.search(q='project:inbox area:* status:active due:today orderby:due',
                     cols="dtDue,sTitle,sStatus")

    myList = []

    for case in resp.cases:
        date = datetime.strptime(case.dtdue.string, '%Y-%m-%dT%H:%M:%SZ').strftime('%m/%d/%Y')
        time = case.dtdue.string[11:16]
        departure = case.stitle.string.encode('UTF-8').replace('\"', '')
        if (datetime.strptime(case.dtdue.string, '%Y-%m-%dT%H:%M:%SZ') - datetime.now()).days < 0:
            status = 3
        else:
            status = 2
        track = random.randrange(0, 100)
        myList.append({'sDate': date,
                      'sTime': time,
                      'sDeparture': departure,
                      'nStatus': 2,
                      'nTrack': track,
                      'bLight': False})

#turn on the top light
    try:
        myList[0]['bLight'] = True
    except:
        pass

    print "Content-Type: application/json"
    print
    print json.dumps(myList)

if __name__ == '__main__':
    cgi()
