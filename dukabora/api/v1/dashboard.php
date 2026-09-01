<?php
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../includes/api_auth.php';
require_once __DIR__ . '/../../includes/dashboard_metrics.php';

require_api_auth();
header('Content-Type: application/json; charset=utf-8');

$seller_id = get_api_user_id();
$metrics = get_seller_dashboard_metrics($conn, $seller_id);

$response = [
    'success' => true,
    'data' => $metrics,
];

echo json_encode($response);
