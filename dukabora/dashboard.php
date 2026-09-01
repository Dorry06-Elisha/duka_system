<?php
require 'includes/auth_check.php';
require 'db.php';
require 'includes/dashboard_metrics.php';

$seller_id = $_SESSION['user_id'] ?? 0;
$metrics = get_seller_dashboard_metrics($conn, $seller_id);

$today_revenue = $metrics['today_revenue'];
$today_profit = $metrics['today_profit'];
$low_stock_count = $metrics['low_stock_count'];
$total_products = $metrics['total_products'];
$inventory_value = $metrics['inventory_value'];
$stock_alerts = $metrics['stock_alerts'];
$recent_sales = $metrics['recent_sales'];
$chart_labels = $metrics['revenue_labels'];
$chart_data = $metrics['revenue_data'];

require 'includes/header.php';
?>
<div class="container">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="section-title mb-0">Welcome back, <?= htmlspecialchars($_SESSION['name']) ?> 👋</h3>
      <p class="text-muted">Track revenue, profit, stock alerts, and recent sales in real time.</p>
    </div>
    <a href="sales.php" class="btn btn-db btn-lg"><i class="fa-solid fa-bolt me-2"></i>Go to POS / New Sale</a>
  </div>

  <div class="row g-3 mb-4">
    <div class="col-md-3 col-sm-6">
      <div class="stat-card bg-c1">
        <i class="fa-solid fa-calendar-day stat-icon"></i>
        <div class="stat-value" id="todayRevenueValue">Tsh <?= number_format($today_revenue, 2) ?></div>
        <div>Today's Revenue</div>
      </div>
    </div>
    <div class="col-md-3 col-sm-6">
      <div class="stat-card bg-c4">
        <i class="fa-solid fa-chart-line stat-icon"></i>
        <div class="stat-value" id="todayProfitValue">Tsh <?= number_format($today_profit, 2) ?></div>
        <div>Today's Profit</div>
      </div>
    </div>
    <div class="col-md-3 col-sm-6">
      <div class="stat-card bg-c2">
        <i class="fa-solid fa-boxes-stacked stat-icon"></i>
        <div class="stat-value" id="lowStockValue"><?= number_format($low_stock_count, 0) ?></div>
        <div>Low Stock Items</div>
      </div>
    </div>
    <div class="col-md-3 col-sm-6">
      <div class="stat-card bg-c3">
        <i class="fa-solid fa-cubes stat-icon"></i>
        <div class="stat-value" id="totalProductsValue"><?= number_format($total_products, 0) ?></div>
        <div>Total Products</div>
      </div>
    </div>
  </div>

  <div class="row g-3 mb-4">
    <div class="col-lg-8">
      <div class="card p-4 h-100 dashboard-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="section-title mb-0">Revenue Last 7 Days</h5>
          <span class="text-muted">Daily trend</span>
        </div>
        <div class="chart-wrapper">
          <canvas id="revenueChart" height="220"></canvas>
          <div id="revenueChartFallback" class="chart-placeholder d-none">
            No daily trend data available yet. Complete a sale to populate this chart.
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="card p-4 h-100 dashboard-card">
        <h5 class="section-title">Inventory Value</h5>
        <div class="display-6 fw-bold" id="inventoryValue">Tsh <?= number_format($inventory_value, 2) ?></div>
        <p class="text-muted mt-2">Current stock valuation at selling price.</p>
      </div>
    </div>
  </div>

  <div class="row g-3 mb-4">
    <div class="col-lg-6">
      <div class="card p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="section-title mb-0">Critical Stock</h5>
          <span class="badge bg-danger"><?= number_format($low_stock_count, 0) ?> items</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <?php if (empty($stock_alerts)): ?>
                <tr><td colspan="3" class="text-center text-muted">No low-stock products.</td></tr>
              <?php else: foreach ($stock_alerts as $item): ?>
                <tr>
                  <td><?= htmlspecialchars($item['name']) ?></td>
                  <td><?= (int)$item['stock_quantity'] ?></td>
                  <td>Tsh <?= number_format($item['selling_price'], 2) ?></td>
                </tr>
              <?php endforeach; endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card p-4">
        <h5 class="section-title mb-3">Recent Sales</h5>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Cashier</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <?php if (empty($recent_sales)): ?>
                <tr><td colspan="5" class="text-center text-muted">No recent sales yet.</td></tr>
              <?php else: foreach ($recent_sales as $sale): ?>
                <tr>
                  <td><?= htmlspecialchars($sale['product_name']) ?></td>
                  <td><?= (int)$sale['quantity'] ?></td>
                  <td>Tsh <?= number_format($sale['total'], 2) ?></td>
                  <td><?= htmlspecialchars($sale['sold_by']) ?></td>
                  <td><?= htmlspecialchars(date('M j, Y H:i', strtotime($sale['sale_date']))) ?></td>
                </tr>
              <?php endforeach; endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const initialLabels = <?= json_encode($chart_labels) ?>;
const initialData = <?= json_encode($chart_data) ?>;
const ctx = document.getElementById('revenueChart').getContext('2d');
const revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: initialLabels,
        datasets: [{
            label: 'Revenue',
            data: initialData,
            borderColor: '#1b5e3f',
            backgroundColor: 'rgba(27,94,63,0.14)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: {
                grid: { display: false }
            },
            y: {
                ticks: {
                    callback: function(value) {
                        return 'Tsh ' + Number(value).toLocaleString();
                    }
                }
            }
        }
    }
});

const revenueFallback = document.getElementById('revenueChartFallback');
const apiStatus = document.getElementById('dashboardApiStatus');
const todayRevenueValue = document.getElementById('todayRevenueValue');
const todayProfitValue = document.getElementById('todayProfitValue');
const lowStockValue = document.getElementById('lowStockValue');
const totalProductsValue = document.getElementById('totalProductsValue');
const inventoryValue = document.getElementById('inventoryValue');
const sidebarTodayRevenue = document.getElementById('sidebarTodayRevenue');
const sidebarLowStock = document.getElementById('sidebarLowStock');

fetch('api/v1/dashboard.php')
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then((response) => {
        if (response.status !== 200 || !response.body.success) {
            throw new Error(response.body.message || 'Unable to load dashboard data');
        }

        const metrics = response.body.data;
        todayRevenueValue.textContent = `Tsh ${Number(metrics.today_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        todayProfitValue.textContent = `Tsh ${Number(metrics.today_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        lowStockValue.textContent = Number(metrics.low_stock_count).toLocaleString();
        totalProductsValue.textContent = Number(metrics.total_products).toLocaleString();
        inventoryValue.textContent = `Tsh ${Number(metrics.inventory_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (sidebarTodayRevenue) {
            sidebarTodayRevenue.textContent = `Tsh ${Number(metrics.today_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (sidebarLowStock) {
            sidebarLowStock.textContent = `${Number(metrics.low_stock_count).toLocaleString()} low-stock`;
        }

        revenueChart.data.labels = metrics.revenue_labels;
        revenueChart.data.datasets[0].data = metrics.revenue_data;
        revenueChart.update();

        if (!metrics.revenue_data.some(value => Number(value) > 0)) {
            revenueFallback.classList.remove('d-none');
            document.getElementById('revenueChart').classList.add('d-none');
        } else {
            revenueFallback.classList.add('d-none');
            document.getElementById('revenueChart').classList.remove('d-none');
        }
    })
    .catch((error) => {
        apiStatus.classList.remove('d-none');
        apiStatus.textContent = error.message;
    });
</script>

<?php require 'includes/footer.php'; ?>
