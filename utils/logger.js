import winston from 'winston';
import 'winston-daily-rotate-file'; // 🔁 import for rotation

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH', // ⏰ rotate every hour
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '6h', // ⏳ Keep files for 6 hours only
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  level: 'error',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: false,
  maxSize: '10m',
  maxFiles: '6h', // ⏳ Error logs also kept for 6 hours
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport, errorTransport],
});

// 🖥️ Console log for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
