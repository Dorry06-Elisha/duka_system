<?php
require 'includes/auth_check.php';
require 'db.php';

$seller_id = $_SESSION['user_id'] ?? 0;
$edit_product = null;
$error = "";

// Handle Add / Update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $name = trim($_POST['name'] ?? '');
    $selling_price = $_POST['selling_price'] ?? 0;
    $cost_price = $_POST['cost_price'] ?? 0;
    $stock_quantity = $_POST['stock_quantity'] ?? 0;

    if ($name === "" || $selling_price === "" || $stock_quantity === "") {
        $error = "Please fill in all required fields.";
    } else {
        if ($action === 'add') {
            $stmt = mysqli_prepare($conn, "INSERT INTO products (name, selling_price, cost_price, stock_quantity, seller_id) VALUES (?, ?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "sddii", $name, $selling_price, $cost_price, $stock_quantity, $seller_id);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
        } elseif ($action === 'update') {
            $id = (int)$_POST['id'];
            $stmt = mysqli_prepare($conn, "UPDATE products SET name=?, selling_price=?, cost_price=?, stock_quantity=? WHERE id=? AND seller_id=?");
            mysqli_stmt_bind_param($stmt, "sddiii", $name, $selling_price, $cost_price, $stock_quantity, $id, $seller_id);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
        }
        header("Location: products.php");
        exit;
    }
}

// Handle Delete
if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    $stmt = mysqli_prepare($conn, "DELETE FROM products WHERE id=? AND seller_id=?");
    mysqli_stmt_bind_param($stmt, "ii", $id, $seller_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    header("Location: products.php");
    exit;
}

// Handle Edit fetch
if (isset($_GET['edit'])) {
    $id = (int)$_GET['edit'];
    $stmt = mysqli_prepare($conn, "SELECT * FROM products WHERE id=? AND seller_id=?");
    mysqli_stmt_bind_param($stmt, "ii", $id, $seller_id);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $edit_product = mysqli_fetch_assoc($res);
    mysqli_stmt_close($stmt);
}

$products = [];
$products_stmt = mysqli_prepare($conn, "SELECT * FROM products WHERE seller_id = ? ORDER BY name ASC");
if ($products_stmt) {
    mysqli_stmt_bind_param($products_stmt, 'i', $seller_id);
    mysqli_stmt_execute($products_stmt);
    $products_result = mysqli_stmt_get_result($products_stmt);
    $products = $products_result ? mysqli_fetch_all($products_result, MYSQLI_ASSOC) : [];
    mysqli_stmt_close($products_stmt);
}

require 'includes/header.php';
?>
<div class="container">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="section-title mb-0">Products</h3>
    <button class="btn btn-db" data-bs-toggle="modal" data-bs-target="#productModal" onclick="setAddMode()">
      <i class="fa-solid fa-plus"></i> Add Product
    </button>
  </div>

  <?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>

  <div class="card p-3">
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Selling Price</th><th>Cost Price</th><th>Stock Qty</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
        <?php if (empty($products)): ?>
          <tr><td colspan="6" class="text-center text-muted">No products added yet.</td></tr>
        <?php else: foreach ($products as $p): ?>
          <tr data-product-id="<?= $p['id'] ?>">
            <td><?= $p['id'] ?></td>
            <td><?= htmlspecialchars($p['name']) ?></td>
            <td>Tsh <?= number_format($p['selling_price'], 2) ?></td>
            <td>Tsh <?= number_format($p['cost_price'], 2) ?></td>
            <td>
              <?= (int)$p['stock_quantity'] ?>
              <?php if ($p['stock_quantity'] <= 5): ?><span class="badge bg-warning text-dark">Low</span><?php endif; ?>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary"
                data-bs-toggle="modal" data-bs-target="#productModal"
                onclick='setEditMode(<?= json_encode($p) ?>)'>
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger delete-product-btn" data-product-id="<?= $p['id'] ?>" data-product-name="<?= htmlspecialchars($p['name'], ENT_QUOTES) ?>">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        <?php endforeach; endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Add/Edit Modal -->
<div class="modal fade" id="productModal" tabindex="-1">
  <div class="modal-dialog">
    <form method="POST" action="products.php" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">Add Product</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" name="action" id="formAction" value="add">
        <input type="hidden" name="id" id="productId">
        <div class="mb-3">
          <label class="form-label">Product Name</label>
          <input type="text" name="name" id="productName" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Selling Price (Tsh)</label>
          <input type="number" step="0.01" name="selling_price" id="sellingPrice" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Cost Price (Tsh)</label>
          <input type="number" step="0.01" name="cost_price" id="costPrice" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Stock Quantity</label>
          <input type="number" name="stock_quantity" id="stockQuantity" class="form-control" required>
        </div>
      </div>
      <div class="modal-footer">
        <button type="submit" class="btn btn-db">Save</button>
      </div>
    </form>
  </div>
</div>

  <div id="productActionStatus" class="alert d-none mt-3" role="alert"></div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteProductModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Delete Product</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete <strong id="deleteProductName"></strong>?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-danger" id="confirmDeleteProduct">Delete</button>
      </div>
    </div>
  </div>
</div>

<script>
let deleteProductId = null;
const deleteProductModal = document.getElementById('deleteProductModal');
const deleteProductName = document.getElementById('deleteProductName');
const confirmDeleteProduct = document.getElementById('confirmDeleteProduct');
const productActionStatus = document.getElementById('productActionStatus');

function setAddMode() {
  document.getElementById('modalTitle').innerText = 'Add Product';
  document.getElementById('formAction').value = 'add';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('sellingPrice').value = '';
  document.getElementById('costPrice').value = '';
  document.getElementById('stockQuantity').value = '';
}
function setEditMode(p) {
  document.getElementById('modalTitle').innerText = 'Edit Product';
  document.getElementById('formAction').value = 'update';
  document.getElementById('productId').value = p.id;
  document.getElementById('productName').value = p.name;
  document.getElementById('sellingPrice').value = p.selling_price;
  document.getElementById('costPrice').value = p.cost_price;
  document.getElementById('stockQuantity').value = p.stock_quantity;
}

function showProductActionMessage(message, type = 'success') {
  productActionStatus.className = `alert alert-${type}`;
  productActionStatus.textContent = message;
  productActionStatus.classList.remove('d-none');
}

function hideProductActionMessage() {
  productActionStatus.classList.add('d-none');
}

document.querySelectorAll('.delete-product-btn').forEach((button) => {
  button.addEventListener('click', () => {
    deleteProductId = button.dataset.productId;
    deleteProductName.textContent = button.dataset.productName;
    hideProductActionMessage();
    const modal = new bootstrap.Modal(deleteProductModal);
    modal.show();
  });
});

confirmDeleteProduct.addEventListener('click', () => {
  if (!deleteProductId) return;

  fetch(`api/v1/products.php?id=${encodeURIComponent(deleteProductId)}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
    },
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const message = payload?.message || 'Unable to delete product.';
        showProductActionMessage(message, 'danger');
        return;
      }

      const row = document.querySelector(`tr[data-product-id="${deleteProductId}"]`);
      if (row) row.remove();
      showProductActionMessage('Product deleted successfully.', 'success');
      const modal = bootstrap.Modal.getInstance(deleteProductModal);
      if (modal) modal.hide();
    })
    .catch(() => {
      showProductActionMessage('Unable to delete product. Please try again.', 'danger');
    });
});
</script>

<?php require 'includes/footer.php'; ?>
