<?php
// Include the database connection
include 'db.php';

// Validate user input (name, email, password, etc.)
// Assume validation is done here

// Prepare user data for insertion
$userData = [
    'name' => $_POST['name'],
    'email' => $_POST['email'],
    'password' => $_POST['password'],
    'role' => 'user' // or any default role
];

// Convert user data to JSON format
$jsonData = json_encode([$userData]);

// Write JSON data to a temporary file
file_put_contents('temp_data.json', $jsonData);

// Include the insert_data.php script to insert the data
include 'insert_data.php';

// Redirect to login page after successful registration
header("Location: login.php");
exit();
?>