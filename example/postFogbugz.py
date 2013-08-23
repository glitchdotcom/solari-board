#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from __future__ import print_function

import json
import random
import sys, os
import cgi
from datetime import datetime

import fbsettings
from fogbugz import FogBugz


def cgi_callback():
    fb = FogBugz(fbsettings.URL, fbsettings.TOKEN)
    resp = fb.search(q='project:inbox area:* status:active due:today orderby:due',
                     cols="dtDue,sTitle")

    cases = []

    for case in resp.cases:
        date = datetime.strptime(case.dtdue.string, '%Y-%m-%dT%H:%M:%SZ').strftime('%m/%d/%Y')
        time = case.dtdue.string[11:16]
        departure = case.stitle.string.encode('UTF-8').replace('\"', '')
        track = random.randrange(0, 100)
        if (datetime.strptime(case.dtdue.string, '%Y-%m-%dT%H:%M:%SZ') - datetime.now()).days < 0:
           status = 3
        else:
           status = 2
        cases.append({'sDate': date,
                      'sTime': time,
                      'sDeparture': departure,
                      'nStatus': status,
                      'nTrack': track,
                      'bLight': False})

    #turn on the top light
    try:
        cases[0]['bLight'] = True
    except:
        pass

    params = cgi.parse_qs(os.environ['QUERY_STRING'])
    print("Content-Type: application/json", end='\n\n')
    print ("%s(%s);" % (params['callback'][0],json.dumps(cases, sys.stdout)))

if __name__ == '__main__':
    cgi_callback()
