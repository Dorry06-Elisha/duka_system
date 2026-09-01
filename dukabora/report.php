<?php
require 'includes/auth_check.php';
require 'db.php';

$range = $_GET['range'] ?? '7_days';
$start_date = $_GET['start_date'] ?? '';
$end_date = $_GET['end_date'] ?? '';
$where = '1=1';
$params = [];
$types = '';

if ($range === 'today') {
    $where = 'DATE(s.sale_date) = CURDATE()';
} elseif ($range === '7_days') {
    $where = 's.sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
} elseif ($range === 'this_month') {
    $where = 'YEAR(s.sale_date) = YEAR(CURDATE()) AND MONTH(s.sale_date) = MONTH(CURDATE())';
} elseif ($range === 'custom' && $start_date && $end_date) {
    $where = 'DATE(s.sale_date) BETWEEN ? AND ?';
    $params = [$start_date, $end_date];
    $types = 'ss';
}

function query_scalar($conn, $sql, $types = '', $params = []) {
    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        return 0;
    }
    if ($types && $params) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $value);
    mysqli_stmt_fetch($stmt);
    mysqli_stmt_close($stmt);
    return $value ?? 0;
}

$total_revenue = query_scalar($conn, "SELECT COALESCE(SUM(s.total),0) FROM sales s WHERE {$where}", $types, $params);
$total_items = query_scalar($conn, "SELECT COALESCE(SUM(s.quantity),0) FROM sales s WHERE {$where}", $types, $params);

$top_selling = query_scalar($conn, "SELECT COALESCE(p.name, 'N/A') FROM sales s JOIN products p ON s.product_id = p.id WHERE {$where} GROUP BY p.id ORDER BY SUM(s.quantity) DESC LIMIT 1", $types, $params);

$history_sql = "SELECT s.id, p.name AS product_name, s.quantity, s.sale_price, s.total, COALESCE(u.name, 'Unknown') AS sold_by, s.sale_date FROM sales s LEFT JOIN products p ON s.product_id = p.id LEFT JOIN users u ON s.sold_by = u.id WHERE {$where} ORDER BY s.sale_date DESC";
$history_stmt = mysqli_prepare($conn, $history_sql);
$history = [];
if ($history_stmt) {
    if ($types && $params) {
        mysqli_stmt_bind_param($history_stmt, $types, ...$params);
    }
    mysqli_stmt_execute($history_stmt);
    $result = mysqli_stmt_get_result($history_stmt);
    $history = $result ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
    mysqli_stmt_close($history_stmt);
}

require 'includes/header.php';
?>
<div class="container">
  <h3 class="section-title mb-4">Sales Report</h3>

  <div class="row g-3 mb-4">
    <div class="col-md-4">
      <div class="stat-card bg-c1">
        <div class="stat-value">Tsh <?= number_format($total_revenue, 2) ?></div>
        <div>Total Revenue</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="stat-card bg-c3">
        <div class="stat-value"><?= (int)$total_items ?></div>
        <div>Total Items Sold</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="stat-card bg-c4">
        <div class="stat-value"><?= htmlspecialchars($top_selling) ?></div>
        <div>Top Selling Product</div>
      </div>
    </div>
  </div>

  <div class="card p-4 mb-4">
    <form method="GET" action="report.php" class="row g-3 align-items-end">
      <div class="col-md-3">
        <label class="form-label">Range</label>
        <select name="range" class="form-select" onchange="toggleCustomDates(this.value)">
          <option value="today" <?= $range === 'today' ? 'selected' : '' ?>>Today</option>
          <option value="7_days" <?= $range === '7_days' ? 'selected' : '' ?>>Last 7 Days</option>
          <option value="this_month" <?= $range === 'this_month' ? 'selected' : '' ?>>This Month</option>
          <option value="custom" <?= $range === 'custom' ? 'selected' : '' ?>>Custom Range</option>
        </select>
      </div>
      <div class="col-md-3 custom-date" style="display: <?= $range === 'custom' ? 'block' : 'none' ?>;">
        <label class="form-label">Start Date</label>
        <input type="date" name="start_date" class="form-control" value="<?= htmlspecialchars($start_date) ?>">
      </div>
      <div class="col-md-3 custom-date" style="display: <?= $range === 'custom' ? 'block' : 'none' ?>;">
        <label class="form-label">End Date</label>
        <input type="date" name="end_date" class="form-control" value="<?= htmlspecialchars($end_date) ?>">
      </div>
      <div class="col-md-3">
        <button type="submit" class="btn btn-db">Filter</button>
      </div>
    </form>
  </div>

  <div class="card p-4">
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Sold By</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($history)): ?>
            <tr><td colspan="7" class="text-center text-muted">No sales history found for this range.</td></tr>
          <?php else: foreach ($history as $sale): ?>
            <tr>
              <td><?= $sale['id'] ?></td>
              <td><?= htmlspecialchars($sale['sale_date']) ?></td>
              <td><?= htmlspecialchars($sale['product_name']) ?></td>
              <td><?= (int)$sale['quantity'] ?></td>
              <td>Tsh <?= number_format($sale['sale_price'], 2) ?></td>
              <td>Tsh <?= number_format($sale['total'], 2) ?></td>
              <td><?= htmlspecialchars($sale['sold_by']) ?></td>
            </tr>
          <?php endforeach; endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
function toggleCustomDates(value) {
  const customFields = document.querySelectorAll('.custom-date');
  customFields.forEach(el => el.style.display = value === 'custom' ? 'block' : 'none');
}
</script>

<?php require 'includes/footer.php'; ?>
