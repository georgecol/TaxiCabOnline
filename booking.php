<?php
// server side code to get input from client  session, then log it in the database
session_start();

$data = $_POST["formData"] // get data from server side post request , post is more secure and you can attach more data
echo "<p>Data received: $data</p>";
// add to session
$_SESSION["bookingID"] // sesion variable, maybe later add the functionality of updating the session on each form element change, so its not lost when you refresh

//estabilish database connection

$a = require_once("databasedetails");

$connection = mysqli_connect($mysqli_db);

if(!connection){
    //error
}{
 // create query.

}


?>