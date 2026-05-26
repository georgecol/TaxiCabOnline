//George Collier
//23221769
// Restraints: not null,certain fields must be numeric so on so forth.
// certain fields

// client side script to send request to server , using JS async fetch method to place a booking

//get form
const form = document.getElementById("bookingForm");
const httpAction = "POST";
//Step 1 , receive input

form.addEventListener('submit', (e) => { // 
    e.preventDefault(); // prevents submission of a blank form, case sensitive event.preventDefault() not event.PreventDefault()
    console.log("submit triggered"); // testing 
    //get form data object
    formData = new FormData(e.target);
    //debug
    for (let [key, value] of formData.entries()) { // debug print
        console.log(`${key}: ${value}`);

    }
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
    if (!formData) {
        return false;
    }
    //more validation needed  
    const phone = formData.get("phone");
    if (!pattern.test(phone)) {
        alert("Phone number must be numeric and 10-12 digits"); //html popout alert box
        return false;
    }
    // check datetime not in past
    const inputDateTime = new Date(
        formData.get("date") + "T" + formData.get("time")
    );

    if (inputDateTime < new Date()) {
        alert("Pickup time cannot be in the past");
        return false;
    }

    return true;
}


function sendBooking(formData, action) {
    var url = "booking.php?action=" + action;
    // step 3
    // send to backend
    fetch(url, {
        method: action,
        body: formData // send form data object, server side stored in _POST array with the form names as the variable names

    })
        .then(res => {
            return res.json(); // extract response
            // return res.text() // raw text for debugging if server sent error to us
        })
        .then(res => {
            // console.log("Raw response:", text);
            // console.log("Second stage after res.json()");
            // console.log(res);
            try {
                // const data = JSON.parse(res.message); // attempt to convert the booking confirmation message from string to json object

                document.getElementById("reference").innerText = res.message; // display string directly to screen, put in the reference div
            } catch (e) {
                console.error("Error parsing response");
            }

        })
        .catch(err => console.error("Error"))

}


