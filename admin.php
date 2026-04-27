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

    $input = trim($_POST['bsearch'] ?? '');

    // CASE 1: reference search
    if (!empty($input)) {

        // if (!preg_match("/^BRN[0-9]{5}$/", $input)) {
            echo json_encode([
                "success" => true,
                "data" => []
            ]);
        //     exit;
        // }

        $stmt = $connection->prepare("SELECT * FROM bookings WHERE booking_ref = ?");
        $stmt->bind_param("s", $input);
    } 
    // CASE 2: unassigned within 2 hours
    else {
        $stmt = $connection->prepare("
            SELECT * FROM bookings 
            WHERE status = 'unassigned'
            AND pickup_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
        ");
    }

    if (!$stmt->execute()) {
        echo json_encode([
            "success" => false,
            "error" => $stmt->error
        ]);
        exit;
    }

    $result = $stmt->get_result();

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
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


// invalid action
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

$connection->close();
?>