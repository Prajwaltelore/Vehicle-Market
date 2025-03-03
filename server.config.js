module.exports = {
  apps: [
    {
      name: "Vehicle-Market-Test",
      script: "dist/main.js",
      instances: 1, // Scale instances to the number of available CPU cores
      exec_mode: "fork", // Cluster mode for load balancing
      watch: true, // Disable watching for production
      ignore_watch: ["node_modules", "logs"],
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      max_memory_restart: "512M",
    },
  ],
};
