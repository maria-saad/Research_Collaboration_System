const pino = require("pino");
const fs = require("fs");
const path = require("path");

// تأكد إن مجلد logs موجود
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, "app.log");

// نكتب على console + ملف
const streams = [
  { stream: process.stdout },
  {
    stream: pino.destination({
      dest: logFile,
      sync: false, // async أفضل للأداء
    }),
  },
];

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: "rcs-backend",
      env: process.env.NODE_ENV || "development",
    },
  },
  pino.multistream(streams)
);

module.exports = logger;
