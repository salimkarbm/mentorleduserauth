export default () => ({
  app_name: process.env.APP_NAME,
  port: parseInt(process.env.PORT as string, 10) || 3000,
  database: {
    uri: process.env.DB_URI || 'mongodb://localhost/mentored',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '1d',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '14d',
    expiresIn: process.env.JWT_EXPIRY || '30s',
  },
});
