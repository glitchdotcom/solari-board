#Solari Board
![](https://trello-attachments.s3.amazonaws.com/51bf2a13808218916c006928/51f02c885eee4b1708001f67/2c081fd8d5fcf4cb505392784667372e/genericBoard.PNG)

Fog Creek has used its [Big Board](http://blog.fogcreek.com/big-board-having-fun-with-data/)
for close to three years...and now you can have your own!

The Solari Board jQuery application will accept JSON from any source. The support team at Fog Creek
feeds in tech call information from FogBugz, but the possibilities are limitless!

The application expects a JSON array wraped in a function call ([JSONP](http://en.wikipedia.org/wiki/JSONP)) and filled with objects that have the
following properties:

  * `sDate`: the day of the appointment.  The Solari board can handle values
    like `yesterday` or `today`.
  * `sDeparture`: an arbitrary string; on our board, it's the email address of
    the support technition who has the support call.
  * `nStatus`: allows you to set the status to one of four statuses: "All Aboard" (`nStatus
    = 1`), "On Time" (`nStatus = 2`), "Delayed" (`nStatus = 3`) or "Departed"(`nStatus = 4`).
  * `nTrack`: an arbitrary integer between 0 and 99; we use it to indicate
    which extension the call should be on, but you can use it for whatever
    purpose you want.
  * `fLight`: should be set to `true` if you want the lightbulb by that row
    illuminated, and `false` otherwise.

Here's an example:

    jsonpCallback(
     [
        {'sDate': 'today',
         'sTime': '13:30', 
         'sDeparture': 'foo@example.com',
         'nStatus': 1,
         'nTrack': 17,
         'fLight': true
        },
        {'sDate': 'yesterday', 
         'sTime': '16:00',
         'sDeparture': 'bar@example.com',
         'nStatus': 2,
         'nTrack': 19,
         'fLight':false
        },
        {'sDate': 'July 8th, 2013',
         'sTime': '16:30',
         'sDeparture': 'baz@example.com',
         'nStatus': 2,
         'nTrack': 23,
         'fLight':false
        }
     ]
    )


#How do I use it?

It's simple!

  1. Include the following lines in your HTML:

        <!-- Fonts -->
        <link href='https://fonts.googleapis.com/css?family=Kelly+Slab' rel='stylesheet' type='text/css'>
        <link href='https://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
        <link href='https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz' rel='stylesheet' type='text/css'>

        <!-- jQuery, transit (for animations), date.js and the solari board -->
        <script type="text/javascript" src="js/jquery.min.js"></script>
        <script type="text/javascript" src="js/jquery.transit.min.js"></script>
        <script type="text/javascript" src="js/date.js"></script>    
        <script type="text/javascript" src="js/solari.js"></script> 

        <!-- CSS -->
        <link rel="stylesheet" type="text/css" href="css/solari.css" />

        <!-- Audio -->
        <audio src="audio/solari.mp3" id='solari-audio'>
                Your browser does not support the audio element.
        </audio>

  2. Add the following script to your webpage's head:

        <script>
            $(document).ready(function() {
                //remove the div parameter to append directly to body
                addSolariBoard("#myDIv");
            });
       </script>

  3. Point the board to the script that will feed it jsonp

        $.post('../example/postJson.py')  // replace this with your own script

Currently, Google Chrome and Internet Explorer are the only supported browsers.
This is due to an issue in animating the CSS property `backgroundPositionY` on
other browsers.  We'd welcome patches that help resolve this issue.

##Additional Configuration and Examples
- Toggle `status_override` in `solari.js` to have the board automatically change the 
  status column using time and date due.
- The `sDate` field takes any 
  [date.js](https://code.google.com/p/datejs/wiki/APIDocumentation#parse) parsable string
  (e.g. `today`, `next monday`)
- There are two included examples, postJsonp.py is a basic script that statically sends the sample payload given above to the solari board.
  postFogbugz.py connects to a FogBugz installation through the [xml api](https://developers.fogbugz.com/default.asp?W199).
  To use either example, Just place all files and folders onto a Python-enabled CGI server, then edit `fbsettings.py` with your FogBugz URL and
  [FogBugz token](http://fogbugz.stackexchange.com/questions/900/how-do-i-get-an-xml-api-token) if needed.

![FogBugz Solari Board](https://trello-attachments.s3.amazonaws.com/51bf2a13808218916c006928/51f02c885eee4b1708001f67/1b1ee7b798d88a6c39cf320d28146b36/fogbgzedition.PNG)

##Copyright

Copyright © 2013 Fog Creek Software, Inc. All rights reserved.

###Licensing

The Solari Board is licensed under the [MIT](http://opensource.org/licenses/mit-license.php) license.
