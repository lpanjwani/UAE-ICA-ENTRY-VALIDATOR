module.exports = {
	apps: [
		{
			name: 'ICA-Approval',
			script: './server.js',
			autorestart: true,
			log_date_format: 'YYYY-MM-DD HH:mm Z',
			env: {
				NODE_ENV: 'development'
			},
			env_production: {
				NODE_ENV: 'production'
			}
		}
	]
};
