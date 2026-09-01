<?php
require_once __DIR__ . '/api_helpers.php';

function get_seller_dashboard_metrics($conn, int $seller_id): array {
    $today_revenue = (float) fetch_scalar($conn, "SELECT COALESCE(SUM(total),0) FROM sales WHERE DATE(sale_date) = CURDATE() AND sold_by = ?", 'i', [$seller_id]);
    $today_profit = (float) fetch_scalar($conn, "SELECT COALESCE(SUM((s.sale_price - p.cost_price) * s.quantity),0) FROM sales s JOIN products p ON s.product_id = p.id WHERE DATE(s.sale_date) = CURDATE() AND s.sold_by = ?", 'i', [$seller_id]);
    $low_stock_count = (int) fetch_scalar($conn, "SELECT COUNT(*) FROM products WHERE stock_quantity <= 5 AND seller_id = ?", 'i', [$seller_id]);
    $total_products = (int) fetch_scalar($conn, "SELECT COUNT(*) FROM products WHERE seller_id = ?", 'i', [$seller_id]);
    $inventory_value = (float) fetch_scalar($conn, "SELECT COALESCE(SUM(stock_quantity * selling_price),0) FROM products WHERE seller_id = ?", 'i', [$seller_id]);

    $stock_alerts = fetch_all_assoc($conn, "SELECT id, name, stock_quantity, selling_price FROM products WHERE stock_quantity <= 5 AND seller_id = ? ORDER BY stock_quantity ASC, name ASC LIMIT 5", 'i', [$seller_id]);

    $recent_sales = fetch_all_assoc($conn, "SELECT s.id, p.name AS product_name, s.quantity, s.total, COALESCE(u.name, 'Unknown') AS sold_by, s.sale_date FROM sales s LEFT JOIN products p ON s.product_id = p.id LEFT JOIN users u ON s.sold_by = u.id WHERE s.sold_by = ? ORDER BY s.sale_date DESC LIMIT 5", 'i', [$seller_id]);

    $revenue_rows = fetch_all_assoc($conn, "SELECT DATE(sale_date) AS day, COALESCE(SUM(total),0) AS revenue FROM sales WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND sold_by = ? GROUP BY DATE(sale_date) ORDER BY DATE(sale_date) ASC", 'i', [$seller_id]);

    $period = new DateTimeImmutable('today');
    $revenue_map = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = $period->sub(new DateInterval("P{$i}D"))->format('Y-m-d');
        $revenue_map[$date] = 0;
    }
    foreach ($revenue_rows as $row) {
        $revenue_map[$row['day']] = (float)$row['revenue'];
    }

    return [
        'today_revenue' => $today_revenue,
        'today_profit' => $today_profit,
        'low_stock_count' => $low_stock_count,
        'total_products' => $total_products,
        'inventory_value' => $inventory_value,
        'stock_alerts' => $stock_alerts,
        'recent_sales' => $recent_sales,
        'revenue_labels' => array_map(fn($date) => date('M j', strtotime($date)), array_keys($revenue_map)),
        'revenue_data' => array_values($revenue_map),
    ];
}
