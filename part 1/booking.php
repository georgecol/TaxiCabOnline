<?php
// George Collier
// 23221769

// server side code to get input from client  session, then log it in the database
header('Content-Type: application/json'); // set header to json, can now only echo json to the front end, no HTML 

// DATABASE 
// get database credentials from sqli
$a = require_once("../../files/sqlinfoassignment.inc.php"); // relative path to file on server

$connection = mysqli_connect($sql_host,$sql_user,$sql_pass,$sql_db); // create connection 


if (!$connection) { // if no, most likely problem with credentials or path to credentials
    echo json_encode([
        "success" => false,
        "message" => "Database connnection failed"
    ]);
    exit;
} 

// Get form values from POST array after send
$cname   = $_POST['cname'] ?? '';
$phone   = $_POST['phone'] ?? '';
$unumber = $_POST['unumber'] ?? '';
$snumber = $_POST['snumber'] ?? '';
$stname  = $_POST['stname'] ?? '';
$sbname  = $_POST['sbname'] ?? '';
$dsbname = $_POST['dsbname'] ?? '';
$date    = $_POST['date'] ?? '';   // format: YYYY-MM-DD
$time    = $_POST['time'] ?? '';   // format: HH:MM

//create query 
$query = "SELECT booking_ref FROM bookings ORDER BY booking_id DESC LIMIT 1";

$result = mysqli_query($connection,$query);

if(!$result){ // if no result, return json w error message
    echo json_encode([ // return associative array with two values, success, and message
        "success"=> false,
        "message"=>"No result from DB"
    ]);
    exit;
}

//each time mysqli_fetch_assoc called - it accesses data at the pointer and then increments it so the next time it accesses, its poiting to the next data, can return false if no row
if ($row = mysqli_fetch_assoc($result)) { // fetch the row, turn it into an associative array with column name as key and column data as value 
    $lastRef = $row['booking_ref']; // access the data at the key 'booking_ref', e.g. BRN00001

    $num = intval(substr($lastRef, 3)); // extract 00001 → 1
    $num++; // increment → 2
} else {
    $num = 1; // first booking
}


// rebuild string
$booking_ref = "BRN" . str_pad($num, 5, "0", STR_PAD_LEFT);


// new query to insert 
// create prepared statement query
// insert
$stmt = $connection->prepare("
INSERT INTO bookings 
(booking_ref, cname, phone, unumber, snumber, stname, sbname, dsbname, 
pickup_date, pickup_time, booking_date, booking_time, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
");
//check statement prepared properly
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Prepare failed: " . $connection->error
    ]);
    exit;
}
// default status if driver not assigned
$status = "unassigned";
//
// get date and time seperately using php date function
$booking_date = date("Y/m/d");
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

// check if statement executes
// if not, send JSON message with sucess = false, message = error message
if(!$stmt->execute()){
    echo json_encode([
        "success" => false,
        "message" => "Statement error: ".$stmt->error
    ]);
    exit;
}  


try { // try catch block here because formatting is giving me alot of errors.
    // send response with booking confirmation
    $formattedDate = date("d/m/Y", strtotime($date));
    $formattedTime = date("H:i", strtotime($time));
    // Return JSON response
    $response = [
        "success" => true,
        "message" => "Thank you for your booking $cname!\n" .
                    "Booking reference number: $booking_ref\n" .
                    "Pickup time: $formattedTime\n" .
                    "Pickup date: $formattedDate"
    ];
    // send response to front end
    echo json_encode($response);
}catch (\Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Something went wrong: " . $e->getMessage()
    ]);
}

$connection->close();

?>