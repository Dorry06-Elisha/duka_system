<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function require_api_auth(): void {
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
}

function get_api_user_id(): int {
    return (int) $_SESSION['user_id'];
}
