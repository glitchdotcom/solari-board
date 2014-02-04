#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from __future__ import print_function

import sys, os
import cgi
import time

def cgi_callback():
    params = cgi.parse_qs(os.environ['QUERY_STRING'])

    # lastts is the last modified date that this browser has already loaded, 0 means this is an initial request
    lastts = 0
    if params.has_key('ts'):
        lastts = int(params['ts'][0])
    # keep count of the number of times waiting so this takes no longer than 30 sec to respond
    attempt = 0

    ts = ''
    while ts == '':
        attempt += 1
        try:
            stats = os.stat('fogbugz.json')
            if (attempt > 56 or int(stats.st_mtime) > lastts):
                # the file either has new data, or we've been waiting long enough, exit the loop
                ts = int(stats.st_mtime)
            else:
                # the file has no new data, wait a half a second and try again
                time.sleep(0.5)
        except:
            break

    if ts == "":
        # a file was not found, return invalid JSON to raise an error in the UI
        json = 'Show fail whale because refreshFogBugz.py has never been called'
        ts = 0
    else:
        f = open('fogbugz.json')
        json = f.read()
        f.close()
        if json == '':
            json = '[]'
    
    print('Content-Type: application/javascript\n')
    # remember this last modified ts, so future requests can tell if there's new data
    print('URL_SUFFIX = "&ts=%s";' % (ts))

    # if responding immediately then kick off another read
    if attempt == 1 and not params.has_key('ts'):
        print('setTimeout(updateSolariBoard, 1000);')

    # support a callback param, or default to "void"
    callback = 'void'
    if params.has_key('callback'):
        callback = params['callback'][0]

    # send the json to jQuery's callback
    print('%s(%s);' % (callback,json))


if __name__ == '__main__':
    cgi_callback()
