<?php
// turn on error output
ini_set('display_errors', 1);
error_reporting(E_ALL);
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

$a = require_once("../../files/sqlinfoassignment.inc.php"); // absolute path to file

$connection = mysqli_connect($sql_host,$sql_user,$sql_pass,$sql_db); // create connection 

if (!$connection) {
    die("DB connection failed: " . mysqli_connect_error());
}


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
// send the query and store the result
$result = mysqli_query($connection,$query);

//each time mysqli_fetch_assoc called - it accesses data at the pointer and then increments it so the next time it accesses, its poiting to the next data, can return false if no row
if ($row = mysqli_fetch_assoc($result)) { // fetch the row, turn it into an associative array with column name as key and column data as value
    $lastRef = $row['booking_ref']; // access the data at the key 'booking_ref', 
} else {
    $lastRef = "BRN00000";
}

$num = intval(substr($lastRef, 3)); // take the integer value of the substring of the booking reference starting at the 3rd position to exclude the letters
// 0001 -> 1
$num++; // increment for new booking 1 -> 2
// rebuild string
$booking_ref = "BRN" . str_pad($num, 5, "0", STR_PAD_LEFT); // pad five 0's on the left of the value
// new query to insert 
// create prepared statement query
// insert
$stmt = $connection->prepare("
INSERT INTO bookings 
(booking_ref, cname, phone, unumber, snumber, stname, sbname, dsbname, pickup_date, pickup_time, booking_date, booking_time, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
");
// default status if driver not assigned
$status = "unassigned";
//
// get date and time seperately using php date function
$booking_date = date("d/m/y");
$booking_time = date("H:i:s");
// bind the values to the statement 
$stmt->bind_param(
    "sssssssssssss",
    $booking_ref,
    $cname,
    $phone,
    $unumber,
    $snumber,
    $stname,
    $sbname,
    $dsbname,
    $date,
    $time,
    $booking_date,
    $booking_time,
    $status
);

$stmt->execute();  
// send response with booking confirmation

//format output
$formattedDate = date("d/m/Y", strtotime($date));
$formattedTime = date("H:i", strtotime($time));
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