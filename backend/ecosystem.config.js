module.exports = {
  apps: [{
    name: "little-helper",
    script: "server.js",
    env: {
      NODE_ENV: "development",
      PORT: 5001,
      JWT_SECRET: "your_jwt_secret_key_here",
      ADMIN_KEY: "tempAdminKey123"
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 5001,
      JWT_SECRET: "your_jwt_secret_key_here",
      ADMIN_KEY: "tempAdminKey123"
    }
  }]
} 