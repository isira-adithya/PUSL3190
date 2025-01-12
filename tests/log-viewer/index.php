<?php
class LogViewer {
    private $logFile;

    public function __construct() {
        $this->logFile = realpath($_SERVER["DOCUMENT_ROOT"]) . '/logs/middlewares.json';
    }

    public function getLogs() {
        if (!file_exists($this->logFile)) {
            return [];
        }
        $content = file_get_contents($this->logFile);
        return json_decode($content, true) ?? [];
    }

    public function formatJson($data) {
        if (empty($data)) {
            return '<span class="text-gray-400">Empty</span>';
        }
        
        $output = '<div class="json-formatter">';
        foreach ($data as $key => $value) {
            $output .= '<div class="json-line">';
            $output .= '<span class="json-key">' . htmlspecialchars($key) . ':</span> ';
            if (is_array($value)) {
                $output .= $this->formatJson($value);
            } else {
                $output .= '<span class="json-value">"' . htmlspecialchars($value) . '"</span>';
            }
            $output .= '</div>';
        }
        $output .= '</div>';
        return $output;
    }
}

$viewer = new LogViewer();
$logs = $viewer->getLogs();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Log Viewer</title>
    <!-- Cirrus CSS -->
    <link rel="stylesheet" href="https://unpkg.com/cirrus-ui">
    <style>
        .log-table {
            overflow-x: auto;
        }
        .truncate {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .expanded {
            white-space: pre-wrap;
            word-break: break-all;
            max-height: none !important;
        }
        .json-formatter {
            font-family: monospace;
            padding-left: 20px;
        }
        .json-line {
            line-height: 1.5;
            margin: 2px 0;
        }
        .json-key {
            color: #0066cc;
            font-weight: bold;
        }
        .json-value {
            color: #008000;
        }
        .toggle-data {
            cursor: pointer;
            max-height: 50px;
            transition: max-height 0.3s ease-out;
            background-color: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
        }
        .toggle-data:hover {
            background-color: #e9ecef;
        }
        .data-cell {
            min-width: 200px;
        }
    </style>
</head>
<body>
    <div class="page-content">
        <div class="row">
            <div class="col-12">
                <a href="/" class="btn btn-primary">&larr; Go Back</a>
                <div class="u-text-center u-my-4">
                    <h1 class="title">Log Viewer</h1>
                    <p class="subtitle">Showing latest <?php echo count($logs); ?> records</p>
                </div>

                <?php if (empty($logs)): ?>
                    <div class="notice error">No logs found.</div>
                <?php else: ?>
                    <div class="card log-table">
                        <div class="content">
                            <table class="table striped">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>URI</th>
                                        <th>GET Data</th>
                                        <th>POST Data</th>
                                        <th>Files</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($logs as $log): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($log['timestamp']); ?></td>
                                            <td class="truncate"><?php echo htmlspecialchars($log['uri']); ?></td>
                                            <td class="data-cell">
                                                <div class="truncate toggle-data" onclick="this.classList.toggle('expanded')">
                                                    <?php echo $viewer->formatJson($log['get_data'] ?? []); ?>
                                                </div>
                                            </td>
                                            <td class="data-cell">
                                                <div class="truncate toggle-data" onclick="this.classList.toggle('expanded')">
                                                    <?php echo $viewer->formatJson($log['post_data'] ?? []); ?>
                                                </div>
                                            </td>
                                            <td class="data-cell">
                                                <div class="truncate toggle-data" onclick="this.classList.toggle('expanded')">
                                                    <?php echo $viewer->formatJson($log['files'] ?? []); ?>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>