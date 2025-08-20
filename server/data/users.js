const bcrypt = require('bcryptjs');

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    isAdmin: true,
  },
  {
    username: 'john',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    isAdmin: false,
  },
  {
    username: 'jane',
    email: 'jane@example.com',
    password: bcrypt.hashSync('password123', 10),
    isAdmin: false,
  },
];

module.exports = users;
