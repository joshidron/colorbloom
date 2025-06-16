<?php
$host = 'localhost';           // Change if your DB is hosted elsewhere
$db   = 'colorcrazedb2';       // Your database name
$user = 'root';                // Default user in XAMPP is 'root'
$pass = '';                    // Default password in XAMPP is empty
$charset = 'utf8mb4';

// Data Source Name
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// PDO options for better security and error reporting
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_PERSISTENT         => true // Optional: for persistent connections
];

try {
    // Create PDO instance
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Log error to server logs
    error_log('Database connection failed: ' . $e->getMessage());
    
    // Return JSON error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database unavailable. Please try again later.'
    ]);
    exit;
}
?>