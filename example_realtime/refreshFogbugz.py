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
    ## Begin sample data loading ##
    ## Customize with your own logic ##
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

    # turn on the top light
    try:
        cases[0]['bLight'] = True
    except:
        pass

    ## End sample data loading ##

    # save json data to be read by liveFogbugz.py
    f = open('fogbugz.json','w')
    f.write(json.dumps(cases, sys.stdout))
    f.close()

    # this page doesn't return the json, but might as well return some stats
    stats = {'error': False, 'cases': len(cases)}

    # support a callback param, or default to "void"
    params = cgi.parse_qs(os.environ['QUERY_STRING'])
    callback = 'void'
    if params.has_key('callback'):
        callback = params['callback'][0]

    print('Content-Type: application/javascript\n')
    print('%s(%s);' % (callback,json.dumps(stats, sys.stdout)))


if __name__ == '__main__':
    cgi_callback()
