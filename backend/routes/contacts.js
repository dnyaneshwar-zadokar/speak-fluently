import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user's contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('contacts contactRequests sentContactRequests');
    res.json({ 
      contacts: user.contacts || [],
      contactRequests: user.contactRequests || [],
      sentRequests: user.sentContactRequests || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
  }
});

// Send a contact request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    
    // Find the user to send request to
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send request to yourself
    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }
    
    const currentUser = await User.findById(req.userId);
    
    // Check if already in contacts
    const alreadyContact = currentUser.contacts.some(c => c.userId.toString() === targetUser._id.toString());
    if (alreadyContact) {
      return res.status(400).json({ message: 'User already in contacts' });
    }
    
    // Check if request already sent
    const alreadySent = currentUser.sentContactRequests.some(r => r.toUserId.toString() === targetUser._id.toString());
    if (alreadySent) {
      return res.status(400).json({ message: 'Contact request already sent' });
    }
    
    // Check if already received request from this user
    const receivedRequest = currentUser.contactRequests.some(r => r.fromUserId.toString() === targetUser._id.toString());
    if (receivedRequest) {
      return res.status(400).json({ message: 'This user has already sent you a request. Accept it from your requests!' });
    }
    
    // Add to sender's sent requests
    currentUser.sentContactRequests.push({
      toUserId: targetUser._id,
      toUsername: targetUser.username
    });
    await currentUser.save();
    
    // Add to receiver's contact requests
    targetUser.contactRequests.push({
      fromUserId: currentUser._id,
      fromUsername: currentUser.username
    });
    await targetUser.save();
    
    res.json({ message: 'Contact request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send request', error: error.message });
  }
});

// Remove a contact
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.contacts = user.contacts.filter(c => c.userId.toString() !== req.params.userId);
    await user.save();
    
    res.json({ message: 'Contact removed successfully', contacts: user.contacts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove contact', error: error.message });
  }
});

// Accept contact request
router.post('/accept/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const user = await User.findById(req.userId);
    const request = user.contactRequests.id(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const fromUser = await User.findById(request.fromUserId);
    
    // Add to both users' contacts
    user.contacts.push({
      userId: fromUser._id,
      username: fromUser.username
    });
    
    fromUser.contacts.push({
      userId: user._id,
      username: user.username
    });
    
    // Remove from requests
    user.contactRequests.pull(requestId);
    fromUser.sentContactRequests = fromUser.sentContactRequests.filter(
      r => r.toUserId.toString() !== user._id.toString()
    );
    
    await user.save();
    await fromUser.save();
    
    res.json({ 
      message: 'Contact request accepted',
      contacts: user.contacts,
      contactRequests: user.contactRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept request', error: error.message });
  }
});

// Reject contact request
router.post('/reject/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const user = await User.findById(req.userId);
    const request = user.contactRequests.id(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const fromUser = await User.findById(request.fromUserId);
    
    // Remove from both users
    user.contactRequests.pull(requestId);
    fromUser.sentContactRequests = fromUser.sentContactRequests.filter(
      r => r.toUserId.toString() !== user._id.toString()
    );
    
    await user.save();
    await fromUser.save();
    
    res.json({ 
      message: 'Contact request rejected',
      contactRequests: user.contactRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request', error: error.message });
  }
});

export default router;
