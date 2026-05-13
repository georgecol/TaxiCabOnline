// load bookings within 2 hours of the time on page load
document.addEventListener("DOMContentLoaded", function () {
    // loadDefaultBookings(); - load default ones immediately.
    console.log("DOM is ready!");

});
// handle enter button as a form of submit
document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    queryBookings();
});

function queryBookings(refreshAssign = true) { // if refresh assign not passed, give true as default 
    const ref = document.getElementById("bsearch").value.trim() // remove whitespace from string e.g. "BRN0001  " -> "BRN0001";
    // case 1, query with no params
    if (ref === "") {
        loadDefaultBookings();
        return;
    }
    //case 2
    // if query emtpy then load bookings within 2 hours
    const pattern = /^BRN[0-9]{5}$/; // regex pattern to match booking ref - BRN00001 - MUST be BRN then any 5 numbers
    if (!pattern.test(ref)) {
        alert("Error, input correct booking reference");
        return;
    }
    else {
        searchBookings(ref, refreshAssign);
    }
}



function loadDefaultBookings() {
    //case 1, search bar empty
    // http request to admin server
    fetch("admin.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=search&bsearch=" // send action search with empty value 
    })
        .then(res => res.json()) // parse to json object 
        .then(data => {
            clearAssignBox();
            if (data.success) { // if success message from database = true
                console.log(data);
                renderTable(data.data);
                document.getElementById("message").innerHTML = data.message; // display message from server 
            }
            else { // success = false
                document.getElementById("message").innerHTML = "Error: " + data.error;
            }
        })
}



function searchBookings(ref, refreshAssign) {
    // case 2, ref not empty, load booking value
    fetch("admin.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=search&bsearch=" + encodeURIComponent(ref)
    })
        .then(res => res.json())
        .then(data => {
            if (refreshAssign) clearAssignBox();
            if (data.success) {
                console.log(data);
                renderTable(data.data);
                document.getElementById("message").innerHTML = data.message; // display message from server 
            } else {
                document.getElementById("message").innerHTML = "Error: " + data.error;
            }
        });
}


// send table to html page
function renderTable(data) {
    if (!data || data.length === 0) {
        document.querySelector(".content").innerHTML = "<p>No bookings found.</p>";
        return;
    }
    // craft table
    let html = `
    <table border="1">
        <tr>
            <th>Booking Reference #</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Pickup Suburb</th>
            <th>Destination Suburb</th>
            <th>Pickup Date and Time</th>
            <th>Status</th>
            <th>Assign</th>
        </tr>
    `;
    // fill table with data 
    data.forEach(row => {
        // date in as 2026-03-31 + 11:30:00
        // need to reverse date and delim with /, and take off seconds
        let formattedDate = row.pickup_date.split("-").reverse().join('/'); // ["2026", "03", "30"] -> reverse it and rebuild , "30/03/2026"
        let formattedTime = row.pickup_time.split(":").slice(0, 2).join(":"); // same process, put into array, and only take the first two elements
        let datetime = formattedDate + " " + formattedTime;
        html += `
        <tr>
            <td>${row.booking_ref}</td>       
            <td>${row.cname}</td>
            <td>${row.phone}</td>            
            <td>${row.sbname}</td>
            <td>${row.dsbname}</td>
            <td>${datetime}</td>
            <td>${row.status}</td>
            <td>
                <button onclick="assignBooking('${row.booking_id}', '${row.booking_ref}')"
                ${row.status === "assigned" ? "disabled" : ""}>
                Assign
                </button>
            </td>
        </tr>
        `;
    });
    html += "</table>"; // append closing tag
    document.querySelector(".content").innerHTML = html; // get content div and set the data to the html we just created which is a fully populated table
}

function assignBooking(id, bookingref) {
    fetch("admin.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ // cleaner way of doing it, instead of encodeURIComponent(id)
            action: "assign",
            id: id,
            ref: bookingref
        })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById("assignConfirm").innerHTML = data.message;
            // refreshTable();
            queryBookings(false); // to refresh table, gets rid of message however
        });
}
// helper function to cut down on repeat code
function clearAssignBox() {
    document.getElementById("assignConfirm").innerHTML = ""; // clear assign confirm box (just incase)
}