<?php
require 'includes/auth_check.php';
require 'db.php';

$user_id = $_SESSION['user_id'] ?? null;
$error = "";
$success = "";
$user = [
    'name' => '',
    'username' => '',
    'created_at' => 'Unknown',
    'password' => '',
];

if ($user_id) {
    $created_at_exists = false;
    $column_stmt = mysqli_prepare($conn, "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'created_at'");
    if ($column_stmt) {
        mysqli_stmt_execute($column_stmt);
        mysqli_stmt_bind_result($column_stmt, $created_at_count);
        mysqli_stmt_fetch($column_stmt);
        mysqli_stmt_close($column_stmt);
        $created_at_exists = ((int)$created_at_count > 0);
    }

    if ($created_at_exists) {
        $select_sql = "SELECT name, username, password, created_at FROM users WHERE id = ?";
    } else {
        $select_sql = "SELECT name, username, password FROM users WHERE id = ?";
    }

    $select_stmt = mysqli_prepare($conn, $select_sql);
    if ($select_stmt) {
        mysqli_stmt_bind_param($select_stmt, "i", $user_id);
        mysqli_stmt_execute($select_stmt);

        if ($created_at_exists) {
            mysqli_stmt_bind_result($select_stmt, $name, $username, $hashed_password, $created_at);
        } else {
            mysqli_stmt_bind_result($select_stmt, $name, $username, $hashed_password);
            $created_at = 'Unknown';
        }

        if (mysqli_stmt_fetch($select_stmt)) {
            $user = [
                'name' => $name,
                'username' => $username,
                'created_at' => $created_at ?: 'Unknown',
                'password' => $hashed_password,
            ];
        }
        mysqli_stmt_close($select_stmt);
    } else {
        $error = 'Unable to load profile details. Please try again later.';
    }
} else {
    $error = 'Unable to identify the logged-in user. Please login again.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $current_password = $_POST['current_password'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if ($current_password === '' || $new_password === '' || $confirm_password === '') {
        $error = 'All password fields are required.';
    } elseif (empty($user['password']) || !password_verify($current_password, $user['password'])) {
        $error = 'Current password is incorrect.';
    } elseif ($new_password !== $confirm_password) {
        $error = 'New password and confirmation do not match.';
    } elseif (strlen($new_password) < 8) {
        $error = 'New password must be at least 8 characters long.';
    } else {
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $update_stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE id = ?");
        if ($update_stmt) {
            mysqli_stmt_bind_param($update_stmt, "si", $new_hash, $user_id);
            if (mysqli_stmt_execute($update_stmt)) {
                $success = 'Password updated successfully.';
                $user['password'] = $new_hash;
            } else {
                $error = 'Unable to update password. Please try again.';
            }
            mysqli_stmt_close($update_stmt);
        } else {
            $error = 'Unable to prepare password update.';
        }
    }
}

require 'includes/header.php';
?>
<div class="container">
  <div class="row">
    <div class="col-lg-5 mb-4">
      <div class="card p-4">
        <h5 class="section-title">My Profile</h5>
        <p><strong>Name</strong></p>
        <p><?= htmlspecialchars($user['name']) ?></p>
        <p><strong>Username</strong></p>
        <p><?= htmlspecialchars($user['username']) ?></p>
        <p><strong>Member Since</strong></p>
        <p><?= htmlspecialchars($user['created_at']) ?></p>
      </div>
    </div>
    <div class="col-lg-7">
      <div class="card p-4">
        <h5 class="section-title">Change Password</h5>
        <?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert alert-success"><?= htmlspecialchars($success) ?></div><?php endif; ?>
        <form method="POST" action="profile.php">
          <div class="mb-3">
            <label class="form-label">Current Password</label>
            <input type="password" name="current_password" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">New Password</label>
            <input type="password" name="new_password" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Confirm New Password</label>
            <input type="password" name="confirm_password" class="form-control" required>
          </div>
          <button type="submit" class="btn btn-db">Update Password</button>
        </form>
      </div>
    </div>
  </div>
</div>
<?php require 'includes/footer.php'; ?>
