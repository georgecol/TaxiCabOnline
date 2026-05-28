<?php
// George Collier 
// 23221769 
header('Content-Type: application/json'); // set response header to json


// DB config
require_once("../../files/sqlinfoassignment.inc.php");
// establish connection from variables loaded from the line above (db config)
$connection = mysqli_connect($sql_host, $sql_user, $sql_pass, $sql_db);
// check connection
if (!$connection) {
    echo json_encode([
        "success" => false,
        "error" => "DB connection failed: " . mysqli_connect_error()
    ]);
    exit;
}

// get action safely (search,assign)
$action = $_POST['action'] ?? '';


// search bookings 
if ($action === "search") {
    $input = trim($_POST['bsearch'] ?? ''); // get value from post request array id = bsearch

    // CASE 1: reference search
    if (!empty($input)) {
        $stmt = $connection->prepare("SELECT * FROM bookings WHERE booking_ref = ?");
        $stmt->bind_param("s", $input);
        $message = "Searching for booking with ref: ". $input;
    } else { // case if the search param is empty
        // default bookings (within 2 hours)
        $stmt = $connection->prepare("
            SELECT * FROM bookings 
            WHERE status = 'unassigned'
            AND pickup_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
            AND pickup_date = CURRENT_DATE() 
        ");
        $message = "Displaying bookings unassigned and due in the next 2 hours"; // display message to be put on page
    }
   
    if (!$stmt->execute()) {
        // if statement doesnt execute, return JSON object with two key value pairs
        // success: false, error: statement error
        // return to frontend
        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
        $connection->close(); // cleanup
        exit; 
    }

    $result = $stmt->get_result();

    $data = [];
    // fill array with row results from result set
    // should only be 1 result for search
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    // return json object with data
    echo json_encode([
        "success" => true,
        "message" => $message,
        "data" => $data
    ]);
    $connection->close();
    exit;
}

// assign a booking
if ($action === "assign") {
    // get id from request 
    $id = $_POST['id'] ?? ''; 
    $ref = $_POST['ref'] ?? ''; // get booking reference from request parameters
    // if no id, return false with error message
    if (empty($id)) {
        echo json_encode([
            "success" => false,
            "message" => "Missing booking ID"
        ]);
        $connection->close();
        exit;
    } 
    // if have id, prepare sql statement to edit booking
    $stmt = $connection->prepare("
        UPDATE bookings 
        SET status = 'assigned' 
        WHERE booking_id = ?
    ");
    // insert the id into the statement
    $stmt->bind_param("s", $id);
    // execute statement , returns 1 if executes correctly,
    if ($stmt->execute()) { // send confirmation message if true
        echo json_encode([
            "success" => true,
            "message" => "Congratulations! Booking Request $ref has been assigned!"
        ]);
    } else {
        echo json_encode([ // error message if false
            "success" => false,
            "message" => "Error assigning booking $ref",
            "error" => $stmt->error
        ]);
    }
    $connection->close();
    exit; // exit to not run the rest of the code
}

//last catch
// invalid action, runs if none of the above if statements fire
// executes because all other cases have an exit call after they have finished
// hence invalid action
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

$connection->close();
?>