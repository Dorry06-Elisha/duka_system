<?php
require 'db.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if ($username === "" || $password === "") {
        $error = "Please enter username and password.";
    } else {
        $stmt = mysqli_prepare($conn, "SELECT id, name, username, password FROM users WHERE username = ?");
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "s", $username);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_bind_result($stmt, $user_id, $user_name, $user_username, $user_password);
            mysqli_stmt_store_result($stmt);

            if (mysqli_stmt_num_rows($stmt) === 1 && mysqli_stmt_fetch($stmt) && password_verify($password, $user_password)) {
                $_SESSION['user_id'] = $user_id;
                $_SESSION['name'] = $user_name;
                $_SESSION['username'] = $user_username;
                header("Location: dashboard.php");
                exit;
            } else {
                $error = "Invalid username or password.";
            }

            mysqli_stmt_close($stmt);
        } else {
            $error = "Unable to process login. Please try again later.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login - Duka Bora</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="auth-wrapper">
  <div class="auth-card">
    <div class="text-center mb-4">
      <i class="fa-solid fa-shop fa-2x"></i>
      <h2 class="mt-2">Duka Bora</h2>
      <p class="text-muted">Login to your seller account</p>
    </div>

    <?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>

    <form method="POST" action="login.php" autocomplete="off">
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input type="text" name="username" class="form-control" required autofocus autocomplete="off">
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-control" required autocomplete="new-password">
      </div>
      <button type="submit" class="btn btn-db w-100 py-2">Login</button>
    </form>
    <p class="text-center mt-3 mb-0">No account yet? <a href="register.php">Register here</a></p>
  </div>
</div>
</body>
</html>
