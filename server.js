const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || "/data";
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 读取共享配置
function readConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
        }
    } catch {}
    return null;
}

// 写入共享配置
function writeConfig(data) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
}

app.use(express.json({ limit: "10mb" }));

// ===== 共享配置 API =====

// 读取配置
app.get("/api/config", (_req, res) => {
    const config = readConfig();
    if (!config) return res.json({ exists: false });
    res.json({ exists: true, ...config });
});

// 保存配置
app.post("/api/config", (req, res) => {
    try {
        writeConfig(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===== 静态文件托管 =====
const distDir = path.join(__dirname, "web", "dist");
app.use(express.static(distDir));

// SPA fallback (Express 5 syntax)
app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
    console.log(`infinite-canvas server: http://localhost:${PORT}`);
    console.log(`config storage: ${CONFIG_FILE}`);
});
