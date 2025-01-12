<?php
class LoggingMiddleware {
    private $logFile;
    private $maxRecords = 50;

    public function __construct() {
        $this->logFile = realpath($_SERVER["DOCUMENT_ROOT"]) . '/logs/middlewares.json';
        
        // Create the file if it doesn't exist
        if (!file_exists($this->logFile)) {
            file_put_contents($this->logFile, json_encode([]));
        }
    }

    public function log() {
        // Read existing logs
        $logs = $this->readLogs();

        // Create new log entry
        $newLog = [
            'timestamp' => date('d-m-Y H:i:s'),
            'uri' => $_SERVER['REQUEST_URI'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'],
            'post_data' => $_POST,
            'get_data' => $_GET,
            'files' => $_FILES
        ];

        // Add new log to the beginning of the array
        array_unshift($logs, $newLog);

        // Keep only the latest 50 records
        $logs = array_slice($logs, 0, $this->maxRecords);

        // Save updated logs
        $this->saveLogs($logs);
    }

    private function readLogs() {
        $content = file_get_contents($this->logFile);
        return json_decode($content, true) ?? [];
    }

    private function saveLogs($logs) {
        $jsonContent = json_encode($logs, JSON_PRETTY_PRINT);
        file_put_contents($this->logFile, $jsonContent);
    }
}

// Usage
$logger = new LoggingMiddleware();
$logger->log();
?>