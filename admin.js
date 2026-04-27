// load bookings within 2 hours of the time on page load
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM is ready!");

});
function queryBookings(){
    
}


function loadDefaultBookings() {
    if (ref === "") {
        fetch("admin.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=" + encodeURIComponent(ref)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log(data);
                    renderTable(data.data);
                }
                else {
                    document.getElementById("message").innerHTML = "Error: " + data.error;
                }
            })
    }
}



function searchBookings() {
    const ref = document.getElementById("bsearch").value;
    // validation
    // if query emtpy then load bookings within 2 hours
    const pattern = /^BRN[0-9]{5}$/;
    if (!pattern.test(ref)) {
        alert("Error, input correct booking reference");
        return false;
    }
    else {
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
                } else {
                    document.getElementById("message").innerHTML = "Error: " + data.error;
                }
            });
    }

}

function renderTable(data) {
    if (!data || data.length === 0) {
        document.querySelector(".content").innerHTML = "<p>No bookings found.</p>";
        return;
    }

    let html = `
    <table border="1">
        <tr>
            <th>Booking Reference Number</th>
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
        html += `
        <tr>
            <td>${row.booking_id}</td>       
            <td>${row.customer_name}</td>
            <td>${row.phone}</td>            
            <td>${row.sbname}</td>
            <td>${row.dsbname}</td>
            <td>${row.pickup_time}</td>
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
            searchBookings();
        });
}