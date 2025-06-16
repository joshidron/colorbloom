<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

function jsonResponse($success, $message, $data = []) {
    http_response_code($success ? 200 : 400);
    $response = ['success' => $success, 'message' => $message];
    if (!empty($data)) {
        $response['data'] = $data;
    }
    exit(json_encode($response));
}

try {
    $jsonInput = file_get_contents('php://input');
    if ($jsonInput === false || empty($jsonInput)) {
        throw new Exception('No data received or failed to read input');
    }

    $data = json_decode($jsonInput, true);
    if ($data === null) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    // Validate required fields
    $requiredFields = ['firstName', 'lastName', 'email', 'password', 'userType'];
    $missingFields = [];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
    }

    // Validate email
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Please enter a valid email address');
    }

    // Validate password
    if (strlen($data['password']) < 8) {
        throw new Exception('Password must be at least 8 characters long');
    }

    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        throw new Exception('This email is already registered');
    }

    // Validate user type
    $allowedRoles = ['kid', 'parent', 'admin'];
    $role = $data['userType'];
    if (!in_array($role, $allowedRoles)) {
        throw new Exception('Invalid user type selected');
    }

    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert user
    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['firstName'],
        $data['lastName'],
        $email,
        $hashedPassword,
        $data['phone'] ?? null,
        $role
    ]);

    $userId = $pdo->lastInsertId();
    
    jsonResponse(true, 'Registration successful', [
        'userId' => $userId,
        'role' => $role
    ]);

} catch (Exception $e) {
    error_log('Registration Error: ' . $e->getMessage());
    jsonResponse(false, $e->getMessage());
}