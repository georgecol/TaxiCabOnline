Files used in part 1 system:

Admin:
- admin.html
- admin.js
- admin.php

Booking
- booking.html
- booking.js
- booking.php
- booking.css

mysqlcommand.txt - initial database command I used, and the secondary one I used to remake the table upon new requirements

Instructions for testing:
Interact with the system through booking.html and admin.html.
To test the full flow, first create a booking through booking.html that is due on the current day and within the next two hours.  
Confirm the confirmation message shows, and take note of the booking reference. Then switch to admin.html through the hyperlink at the top of the page. 
Select search with an empty query, or search via the booking reference displayed in the confirmation message.
The booking you just created should display, with the optioin to assign it, in the last row.
Select the assign button, it should display a confirmation message at the top of the row, and the value unassigned should switch to assigned.


Future improvements:
If I were to improve this manually and extend the functionality I would add more security checks and validation on the form data.
For example, currently there is no validation on the street name, and address. I would implement a library to check the address is valid.


