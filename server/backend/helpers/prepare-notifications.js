function formatTimestamp(timestamp) {
    const date = new Date(timestamp || Date.now());
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

// Helper function to determine severity based on context
function determineSeverity(xssAlert) {
    // Simple algorithm to determine severity based on available data
    let severity = "Medium";

    // Higher severity if auth cookies or sensitive paths are found
    if (xssAlert.cookies &&
        (xssAlert.cookies.includes("auth") ||
            xssAlert.cookies.includes("session") ||
            xssAlert.cookies.includes("token"))) {
        severity = "High";
    }

    // Higher severity if in admin/dashboard paths
    if (xssAlert.location.href.match(/admin|dashboard|account|profile|payment/i)) {
        severity = "High";
    }

    // Critical if both conditions are met
    if (severity === "High" && xssAlert.cookies &&
        (xssAlert.cookies.includes("auth") || xssAlert.location.href.match(/admin|dashboard/i))) {
        severity = "Critical";
    }

    return severity;
}

// Helper function to truncate long strings
function truncate(str, maxLength = 100) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

/**
 * Prepares a rich Discord webhook message for XSS alerts
 * @param {Object} xssAlert - The XSS alert data
 * @returns {Object} Discord webhook message object
 */
function prepareDiscordMessage(xssAlert) {
    const severity = determineSeverity(xssAlert);
    const timestamp = formatTimestamp(xssAlert.timestamp);

    // Color mapping (Discord uses decimal color codes)
    const colorMap = {
        "Low": 5814783,      // Blue
        "Medium": 16776960,  // Yellow
        "High": 16744192,    // Orange
        "Critical": 16711680 // Red
    };

    return {
        content: `🚨 **New XSS Vulnerability Detected** 🚨`,
        embeds: [{
            title: `XSS Alert: ${xssAlert.id}`,
            color: colorMap[severity] || colorMap["Medium"],
            fields: [
                {
                    name: "🔗 Vulnerable URL",
                    value: `\`\`\`${truncate(xssAlert.location.href)}\`\`\``,
                    inline: false
                },
                {
                    name: "⚠️ Severity",
                    value: severity,
                    inline: true
                },
                {
                    name: "⏰ Timestamp",
                    value: timestamp,
                    inline: true
                },
                {
                    name: "🌐 Origin",
                    value: `\`${xssAlert.location.origin}\``,
                    inline: true
                },
                {
                    name: "↩️ Referer",
                    value: `\`${truncate(xssAlert.document.referrer || "N/A")}\``,
                    inline: true
                },
                {
                    name: "🔍 User Agent",
                    value: `\`\`\`${truncate(xssAlert.userAgent)}\`\`\``,
                    inline: false
                },
                {
                    name: "🍪 Cookies",
                    value: `\`\`\`${truncate(xssAlert.cookies || "None")}\`\`\``,
                    inline: false
                },
                {
                    name: "🌍 Victim IP",
                    value: `[${xssAlert.ip}](https://ipinfo.io/${xssAlert.ip})`,
                    inline: true
                }
            ],
            footer: {
                text: "XSS Alert System • Investigate immediately"
            },
            timestamp: new Date().toISOString()
        }]
    };
}

/**
 * Prepares a rich Slack webhook message for XSS alerts
 * @param {Object} xssAlert - The XSS alert data
 * @returns {Object} Slack webhook message object
 */
function prepareSlackMessage(xssAlert) {
    const severity = determineSeverity(xssAlert);
    const timestamp = formatTimestamp(xssAlert.timestamp);

    // Color mapping for Slack
    const colorMap = {
        "Low": "#5865F2",    // Blue
        "Medium": "#FFCC00", // Yellow
        "High": "#FF8800",   // Orange
        "Critical": "#FF0000" // Red
    };

    return {
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `🚨 XSS Alert: ${xssAlert.id}`,
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Severity:*\n${severity}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Timestamp:*\n${timestamp}`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*🔗 Vulnerable URL:*\n\`${truncate(xssAlert.location.href)}\``
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*🌐 Origin:*\n\`${xssAlert.location.origin}\``
                    },
                    {
                        type: "mrkdwn",
                        text: `*↩️ Referer:*\n\`${truncate(xssAlert.document.referrer || "N/A")}\``
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*🔍 User Agent:*\n\`${truncate(xssAlert.userAgent)}\``
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*🍪 Cookies:*\n\`${truncate(xssAlert.cookies || "None")}\``
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*🌍 Victim IP:*\n<https://ipinfo.io/${xssAlert.ip}|${xssAlert.ip}>`
                    },
                    {
                        type: "mrkdwn",
                        text: "*🔐 Action:*\nInvestigate immediately"
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: "XSS Alert System • Security Team"
                    }
                ]
            }
        ],
        attachments: [
            {
                color: colorMap[severity] || colorMap["Medium"],
                blocks: []
            }
        ]
    };
}

/**
 * Prepares a rich Telegram webhook message for XSS alerts
 * @param {Object} xssAlert - The XSS alert data
 * @returns {string} Telegram message with Markdown formatting
 */
function prepareTelegramMessage(xssAlert) {
    const severity = determineSeverity(xssAlert);
    const timestamp = formatTimestamp(xssAlert.timestamp);

    // Emoji indicators for severity
    const severityEmoji = {
        "Low": "🔵",
        "Medium": "🟡",
        "High": "🟠",
        "Critical": "🔴"
    };

    const message = `
  🚨 *XSS ALERT: ${xssAlert.id}* 🚨
  
  *Severity:* ${severityEmoji[severity] || "⚠️"} ${severity}
  *Detected:* ${timestamp}
  
  *🔗 Vulnerable URL:*
  \`${truncate(xssAlert.location.href)}\`
  
  *🌐 Origin:* \`${xssAlert.location.origin}\`
  *↩️ Referer:* \`${truncate(xssAlert.document.referrer || "N/A")}\`
  
  *🔍 User Agent:*
  \`${truncate(xssAlert.userAgent)}\`
  
  *🍪 Cookies:*
  \`${truncate(xssAlert.cookies || "None")}\`
  
  *🌍 Victim IP:* [${xssAlert.ip}](https://ipinfo.io/${xssAlert.ip})
  
  ⚠️ *Action Required:* Investigate immediately
    `;

    return message.trim();
}

// Export functions for use
export {
    prepareDiscordMessage,
    prepareSlackMessage,
    prepareTelegramMessage
};