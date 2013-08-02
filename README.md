#Solari Board
![](https://trello-attachments.s3.amazonaws.com/51bf2a13808218916c006928/51f02c885eee4b1708001f67/2c081fd8d5fcf4cb505392784667372e/genericBoard.PNG)


Fogcreek has used its [Big Board](http://blog.fogcreek.com/big-board-having-fun-with-data/) for close to three years...and now you can have your own!

The Solari Board jQuery application will accept any JSON payload. The support team at fog creek feeds in tech call information from FogBugz, but the possibilities are limitless!

The solari board assumes a json structure in the following format:

	[
	    {'sDate':'today','sTime':'13:30','sDeparture':'foo@example.com','nStatus':1,'nTrack':17, 'fLight':true},
	    {'sDate':'yesterday','sTime':'16:00','sDeparture':'bar@example.com','nStatus':2,'nTrack':19, 'fLight':false},
	    {'sDate':'July 8th, 2013','sTime':'16:30','sDeparture':'baz@example.com','nStatus':2,'nTrack':23, 'fLight':false}
	]		


#How do I use it?
1. Include the following lines in your html:

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

- Add the following script to your webpage's head:

        <script>
	        $(document).ready(function() {
                //remove the div parameter to append directly to body
	            addSolariBoard("#myDIv");	
	        });
       </script>

- Point the board to the script that will feed it json

        $.post('../example/postJson.py', //replace this with your own script   

Currently, Google Chrome and Internet Explorer are the only supported browsers. This is due to an issue in animating the css property 'backgroundPositionY' on other browsers.

##Additional Configuration and Example
- Toggle "status_override" in solari.js to have the board automatically change the status column using time and date due.
- The sDate field takes any [date.js](https://code.google.com/p/datejs/wiki/APIDocumentation#parse) parsable string (e.g. "today", "next monday")
- The included example is a python script that will connect to a FogBugz installation through the [xml api](https://developers.fogbugz.com/default.asp?W199). Just place all files and folders onto a python enabled server (you may need to edit the first line of postJson.py to point to your own python installation). To use your own, edit fbsettings.py with your URL and[ token](http://fogbugz.stackexchange.com/questions/900/how-do-i-get-an-xml-api-token)

![FogBugz Solari Board](https://trello-attachments.s3.amazonaws.com/51bf2a13808218916c006928/51f02c885eee4b1708001f67/e8996467a3ffff8fb2cceb3a87f88d18/fogbugzEdition.PNG)

##Copyright
Copyright © 2013 Fog Creek Software, Inc. All rights reserved.
###Licensing
The Solari Board is licensed under the [MIT](http://opensource.org/licenses/mit-license.php) license.
