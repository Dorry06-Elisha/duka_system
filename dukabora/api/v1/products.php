<?php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../includes/api_auth.php';
require_once __DIR__ . '/../../includes/api_helpers.php';

require_api_auth();

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];
$seller_id = get_api_user_id();

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid product id']);
        exit;
    }

    $check_stmt = mysqli_prepare($conn, "SELECT id FROM products WHERE id = ? AND seller_id = ?");
    mysqli_stmt_bind_param($check_stmt, 'ii', $id, $seller_id);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);

    if (mysqli_stmt_num_rows($check_stmt) !== 1) {
        mysqli_stmt_close($check_stmt);
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden or product not found']);
        exit;
    }

    mysqli_stmt_close($check_stmt);

    $delete_stmt = mysqli_prepare($conn, "DELETE FROM products WHERE id = ? AND seller_id = ?");
    mysqli_stmt_bind_param($delete_stmt, 'ii', $id, $seller_id);
    $deleted = mysqli_stmt_execute($delete_stmt);
    mysqli_stmt_close($delete_stmt);

    if ($deleted) {
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to delete product']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
