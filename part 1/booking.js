//George Collier
//23221769

// auto-fill date and time on load
const now = new Date(); // get the current date and time

// build date string in YYYY-MM-DD format (required by date input)
// using local time methods so the date matches the user's timezone
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-indexed so add 1, padStart ensures 2 digits e.g. 05 not 5
const day = String(now.getDate()).padStart(2, "0"); // padStart ensures 2 digits e.g. 09 not 9
document.getElementById("date").value = `${year}-${month}-${day}`; // set the date input value

// build time string in HH:MM format` (required by time input)`
const hours = String(now.getHours()).padStart(2, "0"); // padStart ensures 2 digits e.g. 08 not 8
const minutes = String(now.getMinutes()+ 1).padStart(2, "0"); // add one to the minutes so its not in the past
document.getElementById("time").value = `${hours}:${minutes}`; // set the time input value

//get form
const form = document.getElementById("bookingForm");
const httpAction = "POST";
//Step 1 , receive input
// Event listener to validate data 
form.addEventListener('submit', (e) => { // 
    e.preventDefault(); // prevents submission of a blank form, case sensitive event.preventDefault() not event.PreventDefault()
    //get form data object
    formData = new FormData(e.target);
    //validate
    let test = validateData(formData)
    if (test) {
        sendBooking(formData, httpAction); // json form data + POST
    }
    // test fail, end of submit flow
});
//step 2, validate input
function validateData(formData) {
    const pattern = /^\d{10,12}$/;

    // Get phone value from formdata
    let phone = formData.get("phone")
    phone = phone.replace(/\s+/g, ''); // remove whitespaces

    // Make sure that the phone input is ;between 10-12 digits    
    if (!pattern.test(phone)) {
        alert("Phone number must be numeric and 10-12 digits"); //html popout alert box
        return false;
    }
    // check Date not in past
    const inputDateTime = new Date(
        formData.get("date") + "T" + formData.get("time")
    );

    if (inputDateTime < new Date()) {
        alert("Pickup time cannot be in the past");
        return false;
    }

    return true;
}

// Final step, after validation, send the booking to backend, wait for response from php server
// and the display the confirmation message that the server responds with below the booking form.
function sendBooking(formData, action) {
    var url = "booking.php?action=" + action;
    // step 3
    // send to backend
    fetch(url, {
        method: action,
        body: formData // send form data object, server side stored in _POST array with the form names as the variable names
    })
        .then(res => {
            return res.json();  // extract response, only works if server sending good json
        })
        .then(res => {
            try {
                document.getElementById("reference").innerText = res.message; // display string directly to screen, put in the reference div
            } catch (e) {
                console.error("Error parsing response");
            }
        })
        .catch(err => {
            console.error(err);
        })
}

