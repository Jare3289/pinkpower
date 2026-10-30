<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ====================================================
// InfinityFree Database Configuration
// Host: ดูได้จาก InfinityFree Panel → MySQL Databases
// ====================================================
$host    = 'sql211.infinityfree.com'; // ✅ MySQL hostname จาก InfinityFree panel
$db      = 'if0_41995143_pinkpower';  // ✅ ชื่อ database จริง
$user    = 'if0_41995143';
$pass    = 'fqEgnZrbHtJim';
$charset = 'utf8mb4';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // เชื่อมต่อตรงไปยัง database (ไม่สร้าง DB อัตโนมัติ — ต้อง import schema.sql ผ่าน phpMyAdmin)
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, $options);

    // Auto-create settings table if it doesn't exist
    $settingsCheck = $pdo->query("SHOW TABLES LIKE 'settings'")->fetch();
    if (!$settingsCheck) {
        $pdo->exec("CREATE TABLE `settings` (
            `setting_key` VARCHAR(255) PRIMARY KEY,
            `setting_value` TEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        $stmt = $pdo->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?)");
        $stmt->execute(['school_name', 'โรงเรียนสาธิตคณะสีชมพู']);
        $stmt->execute(['academic_year', '2568']);
        $stmt->execute(['quota_high', '4']);
        $stmt->execute(['quota_medium', '3']);
        $stmt->execute(['quota_low', '3']);
        
        $defaultWeeks = [
            "11-15 พฤษภาคม 2569", 
            "8-12 มิถุนายน 2569", 
            "6-10 กรกฎาคม 2569", 
            "3-7 สิงหาคม 2569", 
            "31 สิงหาคม - 4 กันยายน 2569", 
            "28 กันยายน - 2 ตุลาคม 2569", 
            "26-30 ตุลาคม 2569", 
            "23-27 พฤศจิกายน 2569", 
            "21-25 ธันวาคม 2569", 
            "18-22 มกราคม 2570"
        ];
        $stmt->execute(['week_dates', json_encode($defaultWeeks, JSON_UNESCAPED_UNICODE)]);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $action = isset($data['action']) ? $data['action'] : '';

    // Action: saveData (Save schedule)
    if ($action === 'saveData') {
        if (!isset($data['masterSchedule'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing masterSchedule in request']);
            exit;
        }

        $masterSchedule = $data['masterSchedule'];

        try {
            // Fetch teachers and duties ordered by ID to accurately map indices
            $teachers = $pdo->query("SELECT `id` FROM `teachers` ORDER BY `id` ASC")->fetchAll();
            $duties = $pdo->query("SELECT `id` FROM `duties` ORDER BY `id` ASC")->fetchAll();

            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM `schedule`");
            $stmt = $pdo->prepare("INSERT INTO `schedule` (`week_index`, `duty_id`, `teacher_id`) VALUES (?, ?, ?)");

            for ($w = 0; $w < count($masterSchedule); $w++) {
                for ($d = 0; $d < count($masterSchedule[$w]); $d++) {
                    $teacherIdx = $masterSchedule[$w][$d];
                    if ($teacherIdx !== -1 && $teacherIdx < count($teachers) && $d < count($duties)) {
                        $dutyId = $duties[$d]['id'];
                        $teacherId = $teachers[$teacherIdx]['id'];
                        $stmt->execute([$w, $dutyId, $teacherId]);
                    }
                }
            }

            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save schedule: ' . $e->getMessage()]);
        }
        exit;
    }

    // Action: saveSettings
    if ($action === 'saveSettings') {
        if (!isset($data['settings'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing settings data']);
            exit;
        }
        $settings = $data['settings'];
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = ?");
            foreach ($settings as $key => $val) {
                $stmt->execute([$key, $val, $val]);
            }
            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save settings: ' . $e->getMessage()]);
        }
        exit;
    }

    // Action: addTeacher
    if ($action === 'addTeacher') {
        $fullname = trim($data['fullname'] ?? '');
        $gender = $data['gender'] ?? 'F';
        $role = trim($data['role'] ?? 'กรรมการ');
        $classroom = trim($data['classroom'] ?? '');
        if (empty($fullname)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'จำเป็นต้องกรอกชื่อ-นามสกุล']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO `teachers` (`fullname`, `gender`, `role`, `classroom`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$fullname, $gender, $role, $classroom !== '' ? $classroom : null]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // Action: editTeacher
    if ($action === 'editTeacher') {
        $id = (int)($data['id'] ?? 0);
        $fullname = trim($data['fullname'] ?? '');
        $gender = $data['gender'] ?? 'F';
        $role = trim($data['role'] ?? 'กรรมการ');
        $classroom = trim($data['classroom'] ?? '');
        if (!$id || empty($fullname)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ข้อมูลไม่ครบถ้วน']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("UPDATE `teachers` SET `fullname` = ?, `gender` = ?, `role` = ?, `classroom` = ? WHERE `id` = ?");
            $stmt->execute([$fullname, $gender, $role, $classroom !== '' ? $classroom : null, $id]);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // Action: deleteTeacher
    if ($action === 'deleteTeacher') {
        $id = (int)($data['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ไม่ระบุ ID ของคุณครู']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM `teachers` WHERE `id` = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // Action: addDuty
    if ($action === 'addDuty') {
        $name = trim($data['name'] ?? '');
        $level = $data['level'] ?? 'Low';
        $icon = trim($data['icon'] ?? '☀️');
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'จำเป็นต้องกรอกชื่อจุดปฏิบัติเวร']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO `duties` (`name`, `level`, `icon`) VALUES (?, ?, ?)");
            $stmt->execute([$name, $level, $icon]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // Action: editDuty
    if ($action === 'editDuty') {
        $id = (int)($data['id'] ?? 0);
        $name = trim($data['name'] ?? '');
        $level = $data['level'] ?? 'Low';
        $icon = trim($data['icon'] ?? '☀️');
        if (!$id || empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ข้อมูลไม่ครบถ้วน']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("UPDATE `duties` SET `name` = ?, `level` = ?, `icon` = ? WHERE `id` = ?");
            $stmt->execute([$name, $level, $icon, $id]);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // Action: deleteDuty
    if ($action === 'deleteDuty') {
        $id = (int)($data['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ไม่ระบุ ID ของจุดเวร']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM `duties` WHERE `id` = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // Action: resetDatabase
    if ($action === 'resetDatabase') {
        try {
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
            $pdo->exec("DROP TABLE IF EXISTS `schedule`");
            $pdo->exec("DROP TABLE IF EXISTS `teachers`");
            $pdo->exec("DROP TABLE IF EXISTS `duties`");
            $pdo->exec("DROP TABLE IF EXISTS `settings`");
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

            // Re-create tables from scratch
            $pdo->exec("CREATE TABLE `teachers` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `fullname` VARCHAR(255) NOT NULL,
                `gender` CHAR(1) NOT NULL DEFAULT 'F',
                `role` VARCHAR(100) NOT NULL DEFAULT 'กรรมการ',
                `classroom` VARCHAR(50) NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            $pdo->exec("CREATE TABLE `duties` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `level` ENUM('High','Medium','Low') NOT NULL DEFAULT 'Low',
                `icon` VARCHAR(20) NOT NULL DEFAULT '☀️'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            $pdo->exec("CREATE TABLE `schedule` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `week_index` TINYINT NOT NULL,
                `duty_id` INT NOT NULL,
                `teacher_id` INT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            $pdo->exec("CREATE TABLE `settings` (
                `setting_key` VARCHAR(255) PRIMARY KEY,
                `setting_value` TEXT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            
            $stmt = $pdo->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?)");
            $stmt->execute(['school_name', 'โรงเรียนสาธิตคณะสีชมพู']);
            $stmt->execute(['academic_year', '2568']);
            $stmt->execute(['quota_high', '4']);
            $stmt->execute(['quota_medium', '3']);
            $stmt->execute(['quota_low', '3']);
            
            $defaultWeeks = [
                "11-15 พฤษภาคม 2569", 
                "8-12 มิถุนายน 2569", 
                "6-10 กรกฎาคม 2569", 
                "3-7 สิงหาคม 2569", 
                "31 สิงหาคม - 4 กันยายน 2569", 
                "28 กันยายน - 2 ตุลาคม 2569", 
                "26-30 ตุลาคม 2569", 
                "23-27 พฤศจิกายน 2569", 
                "21-25 ธันวาคม 2569", 
                "18-22 มกราคม 2570"
            ];
            $stmt->execute(['week_dates', json_encode($defaultWeeks, JSON_UNESCAPED_UNICODE)]);
            
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to reset database: ' . $e->getMessage()]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Unsupported action']);
    exit;
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $teachers = $pdo->query("SELECT * FROM `teachers` ORDER BY `id` ASC")->fetchAll();
        $duties = $pdo->query("SELECT * FROM `duties` ORDER BY `id` ASC")->fetchAll();
        $scheduleRows = $pdo->query("SELECT * FROM `schedule` ORDER BY `week_index` ASC, `duty_id` ASC")->fetchAll();

        // Get Settings
        $settingsRows = $pdo->query("SELECT * FROM `settings`")->fetchAll();
        $settings = [];
        foreach ($settingsRows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        // Build index-based maps for frontend compatibility
        $teacherIdToIdx = [];
        foreach ($teachers as $idx => $t) {
            $teacherIdToIdx[(int)$t['id']] = $idx;
        }

        $dutyIdToIdx = [];
        foreach ($duties as $idx => $d) {
            $dutyIdToIdx[(int)$d['id']] = $idx;
        }

        $dutiesCount = count($duties);
        $schedule = array_fill(0, 10, array_fill(0, $dutiesCount, -1));
        
        foreach ($scheduleRows as $row) {
            $w = (int)$row['week_index'];
            $dbDutyId = (int)$row['duty_id'];
            $dbTeacherId = (int)$row['teacher_id'];
            
            if (isset($dutyIdToIdx[$dbDutyId]) && isset($teacherIdToIdx[$dbTeacherId])) {
                $dIdx = $dutyIdToIdx[$dbDutyId];
                $tIdx = $teacherIdToIdx[$dbTeacherId];
                if ($w >= 0 && $w < 10 && $dIdx >= 0 && $dIdx < $dutiesCount) {
                    $schedule[$w][$dIdx] = $tIdx;
                }
            }
        }

        $isEmpty = (count($scheduleRows) === 0);

        echo json_encode([
            'success' => true,
            'teachers' => $teachers,
            'duties' => $duties,
            'schedule' => $isEmpty ? [] : $schedule,
            'settings' => $settings
        ]);
    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to retrieve data: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
?>
