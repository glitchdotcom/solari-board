#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from __future__ import print_function

import json
import sys, os
import cgi


def cgi_callback():
    data = [   {'sDate':'today','sTime':'13:30','sDeparture':'foo@example.com','nStatus':1,'nTrack':17, 'fLight':True},
                   {'sDate':'yesterday','sTime':'16:00','sDeparture':'bar@example.com','nStatus':2,'nTrack':19, 'fLight':False},
                   {'sDate':'July 8th, 2013','sTime':'16:30','sDeparture':'baz@example.com','nStatus':2,'nTrack':23, 'fLight':False}
            ]

    params = cgi.parse_qs(os.environ['QUERY_STRING'])
    print("Content-Type: application/json", end='\n\n')
    print ("%s(%s);" % (params['callback'][0], json.dumps(data, sys.stdout)))

if __name__ == '__main__':
    cgi_callback()
