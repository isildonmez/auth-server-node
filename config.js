const connectionUrl = process.env.MONGO_URL
const secret_key = process.env.SUPER_SECRET_KEY

module.exports = {
  'secret': secret_key,
  'url': connectionUrl
};
