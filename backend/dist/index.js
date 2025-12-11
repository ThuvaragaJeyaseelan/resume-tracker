"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const applicant_routes_1 = __importDefault(require("./routes/applicant.routes"));
const app = (0, express_1.default)();
// Ensure uploads directory exists
if (!fs_1.default.existsSync(config_1.config.uploadsDir)) {
    fs_1.default.mkdirSync(config_1.config.uploadsDir, { recursive: true });
}
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/applicants', applicant_routes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
// Start server
app.listen(config_1.config.port, () => {
    console.log(`ATS Backend running on http://localhost:${config_1.config.port}`);
    console.log(`Uploads directory: ${config_1.config.uploadsDir}`);
});
//# sourceMappingURL=index.js.map