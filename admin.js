// load bookings within 2 hours of the time on page load
document.addEventListener("DOMContentLoaded", function () {
    loadDefaultBookings();
    console.log("DOM is ready!");

});
function queryBookings() {
    const ref = document.getElementById("bsearch").value.trim() // remove whitespace from string e.g. "BRN0001  " -> "BRN0001";
    // case 1
    if (ref === "") {
        loadDefaultBookings();
        return;
    }
    //case 2
    // if query emtpy then load bookings within 2 hours
    const pattern = /^BRN[0-9]{5}$/; // regex pattern to match booking ref - BRN00001 - MUST be BRN then any 5 numbers
    if (!pattern.test(ref)) {
        alert("Error, input correct booking reference");
        return false;
    }
    else {
        searchBookings(ref);
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



function searchBookings(ref) {
    // case 2, ref not empty, load booking value
    fetch("admin.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=search&bsearch=" + encodeURIComponent(ref)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log(data);
                renderTable(data.data);
                document.getElementById("message").innerHTML = data.message; // display message from server 
            } else {
                document.getElementById("message").innerHTML = "Error: " + data.error;
            }
        });
}



function renderTable(data) {
    if (!data || data.length === 0) {
        document.querySelector(".content").innerHTML = "<p>No bookings found.</p>";
        return;
    }
    
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
    data.forEach(row => {
        let datetime = row.pickup_date + " "+ row.pickup_time;
        html += `
        <tr>
            <td>${row.booking_id}</td>       
            <td>${row.cname}</td>
            <td>${row.phone}</td>            
            <td>${row.sbname}</td>
            <td>${row.dsbname}</td>
            <td>${datetime}</td>
            <td>${row.status}</td>
            <td>
                <button onclick="assignBooking('${row.booking_id}')"
                ${row.status === "assigned" ? "disabled" : ""}>
                Assign
                </button>
            </td>
        </tr>
        `;
    });
    html += "</table>";
    document.querySelector(".content").innerHTML = html;
}

function assignBooking(id) {
    fetch("admin.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "action=assign&id=" + encodeURIComponent(id)
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById("message").innerHTML = data.message;
            queryBookings();
        });
}