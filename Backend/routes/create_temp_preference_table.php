<?php
// Script to create temp_preference table if not exists
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'LasDosReinas';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "CREATE TABLE IF NOT EXISTS temp_preference (
    preference_id VARCHAR(255) PRIMARY KEY,
    customer_json TEXT,
    items_json TEXT,
    total DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table temp_preference created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>