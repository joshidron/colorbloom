<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid request data');
    }

    // Validate required fields
    $errors = [];

    if (empty($data['email'])) {
        $errors['email'] = 'Email is required';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Please enter a valid email address';
    }

    if (empty($data['password'])) {
        $errors['password'] = 'Password is required';
    }

    if (!empty($errors)) {
        throw new Exception('Validation failed');
    }

    $email = trim($data['email']);
    $password = $data['password'];
    $remember = $data['remember'] ?? false;
    $userType = $data['userType'] ?? 'kid';

    // Fetch user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = ? LIMIT 1");
    $stmt->execute([$email, $userType]);
    $user = $stmt->fetch();

    if (!$user) {
        $errors['email'] = 'No account found with this email';
        throw new Exception('Account not found');
    }

    if (!password_verify($password, $user['password'])) {
        $errors['password'] = 'Incorrect password';
        throw new Exception('Invalid credentials');
    }

    // Start session
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_email'] = $user['email'];

    // Remember me functionality
    if ($remember) {
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+30 days'));

        $updateStmt = $pdo->prepare("UPDATE users SET remember_token = ?, token_expiry = ? WHERE id = ?");
        $updateStmt->execute([$token, $expiry, $user['id']]);

        setcookie('remember_token', $token, [
            'expires' => strtotime('+30 days'),
            'path' => '/',
            'secure' => false, // change to true on HTTPS
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    }

    // Get redirect URL
    $redirectUrl = getRedirectUrl($user['role']);

    // Log for debugging
    error_log("Login successful. Redirect URL: $redirectUrl");

    // Respond with success
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ],
        'redirect' => $redirectUrl
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $errors ?? []
    ]);
    exit;
}

function getRedirectUrl($role) {
    switch ($role) {
        case 'admin':
            return 'admin/dashboard.html';
        case 'parent':
            return 'parent/dashboard.html';
        default:
            return 'index.html';
    }
}
