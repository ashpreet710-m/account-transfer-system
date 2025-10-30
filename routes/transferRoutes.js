const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create sample users
router.post('/create-users', async (req, res) => {
  try {
    const users = await User.insertMany([
      { name: 'Alice', balance: 1000 },
      { name: 'Bob', balance: 500 }
    ]);
    res.status(201).json({ message: 'Users created', users });
  } catch (err) {
    res.status(500).json({ message: 'Error creating users', error: err.message });
  }
});

// Transfer money
router.post('/transfer', async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  if (!fromUserId || !toUserId || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (err) {
    res.status(500).json({ message: 'Error during transfer', error: err.message });
  }
});

module.exports = router;
