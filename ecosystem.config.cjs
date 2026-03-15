/**
 * PM2 Ecosystem Config — TaskKash Dev Server
 * Keeps the server running 24/7 and auto-restarts on crash.
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs   -- start
 *   pm2 stop taskkash-dev            -- stop
 *   pm2 restart taskkash-dev         -- restart
 *   pm2 logs taskkash-dev            -- view logs
 *   pm2 save && pm2 startup          -- auto-start on Windows reboot
 */

module.exports = {
  apps: [
    {
      name: 'taskkash-dev',
      script: 'server/_core/index.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      cwd: 'C:/Users/ahmed/Downloads/TK_2026/WebSite/TaskKash-DigitalOcean',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '5s',
      restart_delay: 3000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-err.log',
      merge_logs: true,
    },
  ],
};
