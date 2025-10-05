module.exports = {
  apps: [{
    name: 'campusgrid',
    script: './server.js',
    
    // Instances
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',  // Cluster mode for load balancing
    
    // Auto-restart configuration
    autorestart: true,
    watch: false,  // Don't watch files in production
    max_memory_restart: '1G',  // Restart if memory exceeds 1GB
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced features for uptime
    min_uptime: '10s',  // Consider app online after 10s
    max_restarts: 10,  // Max 10 restarts within 1 minute
    restart_delay: 4000,  // Wait 4s before restart
    
    // Graceful shutdown
    kill_timeout: 5000,  // Wait 5s for graceful shutdown
    wait_ready: true,  // Wait for app to be ready
    listen_timeout: 10000,  // Wait 10s for app to listen
    
    // Health check
    health_check: {
      enable: true,
      interval: 30000,  // Check every 30s
      path: '/api/health',
      port: 5000
    },
    
    // Monitoring
    monitoring: true,
    
    // Cron restart (optional - restart daily at 3 AM)
    cron_restart: '0 3 * * *'
  }]
};
