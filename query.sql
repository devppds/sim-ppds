SELECT u.username, u.role, u.jabatan_id, j.id as j_id, j.name, j.akses FROM users u LEFT JOIN jabatan j ON u.role = j.name;
