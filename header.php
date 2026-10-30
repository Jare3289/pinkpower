<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8" />
    <title>Pink Power · ระบบบริหารจัดการเวร</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
    <style>
        /* Fallback loader styles */
        #fallback-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #faf6f8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: "Prompt", sans-serif;
            color: #9e6078;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f6e8ec;
            border-top: 5px solid #9e6078;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="fallback-loader">
        <div class="spinner"></div>
        <div style="font-size: 16px; font-weight: 500;">กำลังโหลดระบบจัดเวร Pink Power...</div>
    </div>
    <div id="root"></div>
