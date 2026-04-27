<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

session_start();

// DB config
require_once("../../files/sqlinfoassignment.inc.php");

$connection = mysqli_connect($sql_host, $sql_user, $sql_pass, $sql_db);

if (!$connection) {
    echo json_encode([
        "success" => false,
        "error" => "DB connection failed: " . mysqli_connect_error()
    ]);
    exit;
}

// get action safely
$action = $_POST['action'] ?? '';


// search bookings 
if ($action === "search") {
    $input = trim($_POST['bsearch'] ?? ''); // get value from post request array id = bsearch

    // CASE 1: reference search
    if (!empty($input)) {

        // if (!preg_match("/^BRN[0-9]{5}$/", $input)) {
        //     echo json_encode([
        //         "success" => true,
        //         "data" => []
        //     ]);
        //     exit;
        // }

        $stmt = $connection->prepare("SELECT * FROM bookings WHERE booking_ref = ?");
        $stmt->bind_param("s", $input);
        $message = "Searching for booking with ref: ". $input;
    } else {
        // default bookings (within 2 hours)
        $stmt = $connection->prepare("
            SELECT * FROM bookings 
            WHERE status = 'unassigned'
            AND pickup_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
        ");
        $message = "Displaying bookings due in the next 2 hours";
    }
   
    if (!$stmt->execute()) {
        // if statement doesnt execute, return JSON object with two key value pairs
        // success: false, error: statement error
        // return to frontend
        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
        exit;
    }

    $result = $stmt->get_result();

    $data = [];
    // fill array with row results from result set
    // should only be 1 result for search, and mu
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    // return json object with data
    echo json_encode([
        "success" => true,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

// assign a booking
if ($action === "assign") {

    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode([
            "success" => false,
            "message" => "Missing booking ID"
        ]);
        exit;
    }

    $stmt = $connection->prepare("
        UPDATE bookings 
        SET status = 'assigned' 
        WHERE booking_id = ?
    ");

    $stmt->bind_param("s", $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Booking $id successfully assigned"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Error assigning booking",
            "error" => $stmt->error
        ]);
    }

    exit;
}

if($action === "loadDefault")
    {
    // get bookings from last 2 hours
    // return them
    $stmt = $connection->prepare("
        SELECT * FROM bookings 
        WHERE status = 'unassigned'
        AND pickup_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
    ");
    // execute statement without binding params, because we are not passing any arguments to the query string.
    if (!$stmt->execute()) {
        // if statement doesnt execute, return JSON object with two key value pairs
        // success: false, error: statement error
        // return to frontend
        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
        exit;
    }

    $result = $stmt->get_result();

    $data = [];
    // fill array with row results from result set
    // should only be 1 result for search, and mu
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    // return json object with data
    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
    exit; // exit once done so last return doesnt run
    }

//last catch
// invalid action, runs if none of the above if statements fire
// hence invalid action
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

$connection->close();
?>