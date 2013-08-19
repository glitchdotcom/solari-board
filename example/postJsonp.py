#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from __future__ import print_function

import json
import cgi
import sys

def cgi():
    data = [   {'sDate':'today','sTime':'13:30','sDeparture':'foo@example.com','nStatus':1,'nTrack':17, 'fLight':True},
                   {'sDate':'yesterday','sTime':'16:00','sDeparture':'bar@example.com','nStatus':2,'nTrack':19, 'fLight':False},
                   {'sDate':'July 8th, 2013','sTime':'16:30','sDeparture':'baz@example.com','nStatus':2,'nTrack':23, 'fLight':False}]
                   
    print("Content-Type: application/json", end='\n\n')
    print("jsonpCallback(" +json.dumps(data, sys.stdout) + ")")

if __name__ == '__main__':
    cgi()
