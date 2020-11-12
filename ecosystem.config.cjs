module.exports = {
  apps : [
      {
        name: "miasta",
        script: "./index.js",
        watch: false,
        instance_var: 'INSTANCE_ID',
        env: {
            "PORT": 3010,
            "NODE_ENV": "production"
        }
      }
  ]
}