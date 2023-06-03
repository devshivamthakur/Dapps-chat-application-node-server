const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const Gun = require('gun');
const SEA = require('gun/sea'); // Required for encryption
const crypto = require('crypto');

app.use(Gun.serve);

const server = app.listen(port, () => {
  console.log(`Gun server running on port ${port}🔥`);
});

const gun = Gun({ web: server });

// Custom encryption and description based on userId
gun.on('in', (msg) => {
  const { '#': id, put } = msg;
  const { userId, message } = put;
  
  if (msg.put && userId) {
    const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');
    const encryptedMessage = SEA.encrypt(message, hashedUserId);
    put.encryptedMessage = encryptedMessage;
  }
  
  
});
