
// Restraints: not null,certain fields must be numeric so on so forth.
// certain fields

// client side script to send request to server , using JS async fetch method to place a booking

//get form
const form = document.getElementById("bookingForm");
const httpAction = "POST";
//Step 1 , receive input

form.addEventListener('submit', (e) => { // 
    e.preventDefault(); // prevents submission of a blank form, case sensitive event.preventDefault() not event.PreventDefault()
    console.log("submit triggered"); // testing if this fires.
    //get form data
    const formData = new FormData(e.target); // consolidate form data 

    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);

    }
    if (validateData(formData)) {
        sendBooking(formData, httpAction); // json form data + POST
    }
    else {
        alert("booking data failed validation");
    }
});
//step 2, validate input
function validateData(formData) {
    const pattern = "^\d{10,12}+\s$"
    if (!formData) {
        return false;
    }
    //more validation needed 
    //e.g. 
    const phone = formData.get("phone");
    if(!pattern.test(phone)) {
          alert("Phone number must be numeric and 10-12 digits"); //html popout alert box
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
        headers: {
            'Content-Type': 'application/json'
        },
        body: formData // send form data object, server side stored in _POST array with the form names as the variable names

    })
        .then(res => {
            if (!res.ok) {
                //error
            }
            return res.json(); // parse response back to javascript object
        })
        .then(data => {
            document.getElementById("reference").innerText = data.message; // contents of message key in response to be inserted in the reference <p> element in html page
        })
        .catch(err => console.error("Error"))

}


