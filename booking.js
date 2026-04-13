
// Restraints: not null,certain fields must be numeric so on so forth.
// certain fields

// client side script to send request to server , using JS async fetch method to place a booking

//get form
const form = document.getElementById("bookingForm");

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
        sendBooking(formData, "POST"); // hardcoded action
    }
    alert("booking data failed validation");
});
//step 2, validate input
function validateData(formData) {
    if (!formData) {
        return false;
    }
    //more validation needed 
    //e.g. 
    const phone = formData.get("phone");
    if (!/^[0-9\s]+$/.test(phone)) {
        alert("Phone number must be numeric"); //html popout alert box
        return false;
    }
    return true;
}




function sendBooking(formData, action) {
    var url = "test.php?action=" + action;
    // step 3
    // send to backend
    fetch(url, {
        method: action,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // convert JS object to a string
    
    })
        .then(res => {
            if(!res.ok){
                //error
            }
            return res.json(); // parse response back to javascript object
        })
        .then(data => console.log("Server response", data))
        .catch(err => console.err("Error"))

}


