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
gun.on('onSendMessage', (msg) => {
  const { '#': id, put } = msg;
  const { userId, message } = put;
  
  if (msg.put && userId) {
    const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');
    const encryptedMessage = SEA.encrypt(message, hashedUserId);
    put.encryptedMessage = encryptedMessage;
  }
  
  
});
gun.on('message', async (msg) => {
  const { '#': id, put, get } = msg;
  const { chatroomId, userId, encryptedMessage, fileType } = put;

  if (msg.put && chatroomId && userId && encryptedMessage && fileType === 'txt') {
    const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');
    const decryptedMessage = await SEA.decrypt(encryptedMessage, hashedUserId);
    put.decryptedMessage = decryptedMessage;
    gun.back(msg);
  }
  if (get && chatroomId && get === chatroomId) {
    const messages = [];
    gun.get(chatroomId).map().once((data) => {
      if (data.fileType === 'txt' && data.decryptedMessage) {
        messages.push(data.decryptedMessage);
      }
    });

   gun.back(messages);
    // Send the decrypted messages as a response or perform further actions
  }
});
