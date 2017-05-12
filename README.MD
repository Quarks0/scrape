A chrome extension to pull profile information from people that like.
How to use: Simply go campaign manager, and hit the button. The extension
will automatically open and close tabs for you.

FAQ

1. Why make this?
To automate finding leads for sales/marketing

2. Why not make direct API calls or a web crawler?
At the time of making this, a super strict robots.txt and the overpriced, private API prevented other options

3. Why are you using setTimeout? That's awful practice
Yeah it is, but the site uses ajax calls to populate information on screens.
When opening so many tabs, the network load (in my experience) caused the
content scripts to execute before the elements had been created/populated, resulting in no data. Therefore, timeouts to stagger tab opening and content scraping were added to allow faster loading times

4. Why are you using chrome identity in place of plain OAuth2 or node packages?
So this took me for a spin. The node packages require saving credentials to the file system - chrome extensions don't have access to that. Additionally, webpack clashes with the google packages which I wanted to avoid. I used chrome identity because it was simpler to set up than standard OAuth2

5. Some of these files look eerily similar to another project
I used a joint project, Re:Scan, by me and Tonia Hsia (<3) as a start to avoid having to rewrite a lot of things from scratch. Those assets are largely untouched.

6. How does sheets ...?
All this does is pull data then write to Google Sheets. Any logic will be handled within the spreadsheet itself.

7. You could've done ... better
Probably, but I'm always looking to improve! Send me a message if you have any (constructive) feedback, or a cease and desist.
