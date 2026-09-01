<?php
require 'includes/auth_check.php';
require 'db.php';

$error = "";
$success = "";
$products = [];

$seller_id = $_SESSION['user_id'] ?? 0;
$product_stmt = mysqli_prepare($conn, "SELECT id, name, selling_price, stock_quantity FROM products WHERE seller_id = ? ORDER BY name ASC");
if ($product_stmt) {
    mysqli_stmt_bind_param($product_stmt, 'i', $seller_id);
    mysqli_stmt_execute($product_stmt);
    $result = mysqli_stmt_get_result($product_stmt);
    $products = $result ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
    mysqli_stmt_close($product_stmt);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $product_id = (int)($_POST['product_id'] ?? 0);
    $quantity = (int)($_POST['quantity'] ?? 0);

    if ($product_id <= 0 || $quantity <= 0) {
        $error = "Please select a product and enter a valid quantity.";
    } else {
        $select_stmt = mysqli_prepare($conn, "SELECT name, selling_price, stock_quantity FROM products WHERE id = ?");
        if ($select_stmt) {
            mysqli_stmt_bind_param($select_stmt, "i", $product_id);
            mysqli_stmt_execute($select_stmt);
            mysqli_stmt_bind_result($select_stmt, $product_name, $selling_price, $stock_quantity);
            if (mysqli_stmt_fetch($select_stmt)) {
                mysqli_stmt_close($select_stmt);
                if ($quantity > $stock_quantity) {
                    $error = "Insufficient stock for {$product_name}. Available: {$stock_quantity}.";
                } else {
                    mysqli_begin_transaction($conn);
                    $total = $selling_price * $quantity;

                    $insert_stmt = mysqli_prepare($conn, "INSERT INTO sales (product_id, quantity, sale_price, total, sold_by, sale_date) VALUES (?, ?, ?, ?, ?, NOW())");
                    $update_stmt = mysqli_prepare($conn, "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");

                    if ($insert_stmt && $update_stmt) {
                        mysqli_stmt_bind_param($insert_stmt, "iiddi", $product_id, $quantity, $selling_price, $total, $_SESSION['user_id']);
                        $insert_ok = mysqli_stmt_execute($insert_stmt);
                        mysqli_stmt_close($insert_stmt);

                        mysqli_stmt_bind_param($update_stmt, "ii", $quantity, $product_id);
                        $update_ok = mysqli_stmt_execute($update_stmt);
                        mysqli_stmt_close($update_stmt);

                        if ($insert_ok && $update_ok) {
                            mysqli_commit($conn);
                            $success = "Sale recorded successfully for {$product_name}.";
                            // refresh product list after stock change
                            $product_stmt = mysqli_prepare($conn, "SELECT id, name, selling_price, stock_quantity FROM products WHERE seller_id = ? ORDER BY name ASC");
                            if ($product_stmt) {
                                mysqli_stmt_bind_param($product_stmt, 'i', $seller_id);
                                mysqli_stmt_execute($product_stmt);
                                $result = mysqli_stmt_get_result($product_stmt);
                                $products = $result ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
                                mysqli_stmt_close($product_stmt);
                            }
                        } else {
                            mysqli_rollback($conn);
                            $error = "Failed to record sale. Please try again.";
                        }
                    } else {
                        mysqli_rollback($conn);
                        $error = "Internal error while creating sale records.";
                    }
                }
            } else {
                mysqli_stmt_close($select_stmt);
                $error = "Selected product was not found.";
            }
        } else {
            $error = "Unable to load product details.";
        }
    }
}

$recent_sales = [];
$recent_stmt = mysqli_prepare($conn, "SELECT s.id, p.name AS product_name, s.quantity, s.sale_price, s.total, COALESCE(u.name, 'Unknown') AS sold_by, s.sale_date FROM sales s LEFT JOIN products p ON s.product_id = p.id LEFT JOIN users u ON s.sold_by = u.id WHERE s.sold_by = ? ORDER BY s.sale_date DESC LIMIT 10");
if ($recent_stmt) {
    mysqli_stmt_bind_param($recent_stmt, 'i', $seller_id);
    mysqli_stmt_execute($recent_stmt);
    $recent_result = mysqli_stmt_get_result($recent_stmt);
    $recent_sales = $recent_result ? mysqli_fetch_all($recent_result, MYSQLI_ASSOC) : [];
    mysqli_stmt_close($recent_stmt);
}

require 'includes/header.php';
?>
<div class="container">
  <h3 class="section-title mb-4">Sales</h3>

  <?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>
  <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>

  <div class="card p-4 mb-4">
    <h5 class="section-title">New Sale</h5>
    <form method="POST" action="sales.php">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Product</label>
          <select name="product_id" id="productSelect" class="form-select" required onchange="updateSaleValues()">
            <option value="">Select product</option>
            <?php foreach ($products as $product): ?>
              <option value="<?= $product['id'] ?>" data-price="<?= number_format($product['selling_price'], 2, '.', '') ?>" data-stock="<?= $product['stock_quantity'] ?>">
                <?= htmlspecialchars($product['name']) ?> (<?= $product['stock_quantity'] ?> in stock) - Tsh <?= number_format($product['selling_price'], 2) ?>
              </option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Quantity</label>
          <input type="number" name="quantity" id="quantityInput" class="form-control" min="1" value="1" required oninput="updateSaleValues()">
        </div>
        <div class="col-md-3">
          <label class="form-label">Total</label>
          <input type="text" id="totalPrice" class="form-control" readonly value="Tsh 0.00">
        </div>
      </div>
      <div class="mt-4">
        <button type="submit" class="btn btn-db">Record Sale</button>
      </div>
    </form>
  </div>

  <div class="card p-4">
    <h5 class="section-title">Recent Transactions</h5>
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Sold By</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($recent_sales)): ?>
            <tr><td colspan="7" class="text-center text-muted">No sales recorded yet.</td></tr>
          <?php else: foreach ($recent_sales as $row): ?>
            <tr>
              <td><?= $row['id'] ?></td>
              <td><?= htmlspecialchars($row['product_name']) ?></td>
              <td><?= (int)$row['quantity'] ?></td>
              <td>Tsh <?= number_format($row['sale_price'], 2) ?></td>
              <td>Tsh <?= number_format($row['total'], 2) ?></td>
              <td><?= htmlspecialchars($row['sold_by']) ?></td>
              <td><?= htmlspecialchars($row['sale_date']) ?></td>
            </tr>
          <?php endforeach; endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
function updateSaleValues() {
  const productSelect = document.getElementById('productSelect');
  const quantity = parseInt(document.getElementById('quantityInput').value, 10) || 0;
  const selected = productSelect.options[productSelect.selectedIndex];
  const price = parseFloat(selected?.dataset?.price || 0);
  const total = price * quantity;
  document.getElementById('totalPrice').value = 'Tsh ' + total.toFixed(2);
}
updateSaleValues();
</script>

<?php require 'includes/footer.php'; ?>
