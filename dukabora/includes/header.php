<?php
if (session_status() === PHP_SESSION_NONE) session_start();
$is_logged_in = isset($_SESSION['user_id']);
$current_page = basename($_SERVER['PHP_SELF']);

if ($is_logged_in && !isset($metrics) && isset($conn)) {
    require_once 'includes/dashboard_metrics.php';
    $seller_id = $_SESSION['user_id'] ?? 0;
    $metrics = get_seller_dashboard_metrics($conn, $seller_id);
}

$header_today_revenue = isset($metrics['today_revenue']) ? number_format($metrics['today_revenue'], 2) : '0.00';
$header_low_stock = isset($metrics['low_stock_count']) ? (int)$metrics['low_stock_count'] : 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Duka Bora</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<?php if ($is_logged_in): ?>
<nav class="navbar navbar-expand-lg navbar-dark db-navbar">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="dashboard.php"><i class="fa-solid fa-shop"></i> Duka Bora</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMenu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link <?= $current_page=='dashboard.php'?'active':'' ?>" href="dashboard.php"><i class="fa-solid fa-house"></i> Home</a></li>
        <li class="nav-item"><a class="nav-link dashboard-toggle" href="#" data-dashboard-trigger><i class="fa-solid fa-gauge-simple-high"></i> Dashboard</a></li>
        <li class="nav-item"><a class="nav-link <?= $current_page=='products.php'?'active':'' ?>" href="products.php"><i class="fa-solid fa-boxes-stacked"></i> Products</a></li>
        <li class="nav-item"><a class="nav-link <?= $current_page=='sales.php'?'active':'' ?>" href="sales.php"><i class="fa-solid fa-cash-register"></i> Sales</a></li>
        <li class="nav-item"><a class="nav-link <?= $current_page=='report.php'?'active':'' ?>" href="report.php"><i class="fa-solid fa-chart-line"></i> Report</a></li>
        <li class="nav-item"><a class="nav-link <?= $current_page=='profile.php'?'active':'' ?>" href="profile.php"><i class="fa-solid fa-user"></i> Profile</a></li>
        <li class="nav-item"><a class="nav-link text-danger" href="logout.php"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
      </ul>
    </div>
  </div>
</nav>
<div id="dashboardPanel" class="dashboard-panel" aria-hidden="true">
  <div class="dashboard-panel__backdrop" data-dashboard-close></div>
  <div class="dashboard-panel__content">
    <div class="dashboard-panel__header">
      <div>
        <p class="dashboard-panel__eyebrow">At a glance</p>
        <h4 class="dashboard-panel__title">Duka Bora Overview</h4>
      </div>
      <button class="dashboard-panel__close" type="button" data-dashboard-close aria-label="Close dashboard panel">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="dashboard-panel__stack">
      <div class="dashboard-panel__card">
        <div id="sidebarTodayRevenue" class="dashboard-panel__metric">Tsh <?= htmlspecialchars($header_today_revenue) ?></div>
        <p class="mb-0 text-white-50">Revenue today</p>
      </div>
      <div class="dashboard-panel__card">
        <div id="sidebarLowStock" class="dashboard-panel__metric"><?= htmlspecialchars($header_low_stock) ?> low-stock</div>
        <p class="mb-0 text-white-50">Items need attention</p>
      </div>
    </div>
    <div class="dashboard-panel__card">
      <h6 class="mb-3">Quick access</h6>
      <div class="dashboard-panel__link-list">
        <a href="dashboard.php"><i class="fa-solid fa-house me-2"></i>Overview</a>
        <a href="products.php"><i class="fa-solid fa-boxes-stacked me-2"></i>Products</a>
        <a href="sales.php"><i class="fa-solid fa-cash-register me-2"></i>Sales</a>
        <a href="report.php"><i class="fa-solid fa-chart-line me-2"></i>Reports</a>
      </div>
    </div>
    <div class="dashboard-panel__card">
      <h6 class="mb-3">Live status</h6>
      <ul class="dashboard-panel__status-list">
        <li>Inventory synced in real time</li>
        <li>New sales show instantly</li>
        <li>Alerts stay visible for stock dips</li>
      </ul>
    </div>
  </div>
</div>
<?php endif; ?>
<div class="db-content">
