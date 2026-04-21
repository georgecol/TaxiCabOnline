<?php
// server side code to get input from client  session, then log it in the database
session_start();
// $_SESSION["bookingID"] // sesion variable, maybe later add the functionality of updating the session on each form element change, so its not lost when you refresh

// for debug messages
function console_log($data) {
    $output = json_encode($data);
    echo "<script>console.log($output);</script>";
}

// DATABASE 
// get database credentials from sqli
$a = require_once("/files/sqlinfoassignment.inc.php"); // absolute path to file

$connection = mysqli_connect($sql_host,$sql_user,$sql_pass,$sql_db); // create connection 


if(!$connection){
    //error
} else {
 // create query.
    console_log("Successful database connection") // debug message
}


$data = $_POST["formData"] // get data from server side post request , post is more secure and you can attach more data
echo "<p>Data received: $data</p>";


// Get form values from POST array after send
$cname   = $_POST['cname'];
$phone   = $_POST['phone'];
$unumber = $_POST['unumber'];
$snumber = $_POST['snumber'];
$stname  = $_POST['stname'];
$sbname  = $_POST['sbname'];
$dsbname = $_POST['dsbname'];
$date    = $_POST['date'];   // format: YYYY-MM-DD
$time    = $_POST['time'];   // format: HH:MM

//create query 
$query = "SELECT booking_ref FROM bookings ORDER BY booking_id DESC LIMIT 1";

$result = mysqli_query($connection,$query);

//each time mysqli_fetch_assoc called - it accesses data at the pointer and then increments it so the next time it accesses, its poiting to the next data, can return false if no row
if ($row = mysqli_fetch_assoc($result)) { // fetch the row, turn it into an associative array with column name as key and column data as value
    $lastRef = $row['booking_ref']; // access the data at the key 'booking_ref', 
} else {
    $lastRef = "BRN00000";
}

$num = intval(substr($lastRef, 3)); // "00001" → 1
$num++; // increment

while($remainder != 0 ){
    $remainder = $num % 10;
    $zerocount++;
}
$booking_ref = array ( "B")
for($int i = 0; i < $zerocount;i++){
    $booking_ref+="0";
}


// send response with booking confirmation

// Return JSON response
$response = [
    "message" => "Thank you for your booking!\n" .
                 "Booking reference number: $booking_ref\n" .
                 "Pickup time: $formattedTime\n" .
                 "Pickup date: $formattedDate"
];

header('Content-Type: application/json');
echo json_encode($response);

$connection->close();

?>