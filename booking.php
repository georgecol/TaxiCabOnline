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
$a = require_once("/files/sqlinfo.inc.php") // absolute path to file

$connection = mysqli_connect($mysqli_db);

if(!connection){
    //error
} else {
 // create query.
    console_log("Successful database connection")

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






?>