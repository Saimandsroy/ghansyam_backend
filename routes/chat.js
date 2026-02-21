const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

/**
 * Chat Routes
 * All routes require authentication
 */

// Get users available for chat
router.get('/users', authenticate, chatController.getChatUsers);

// Get or create conversation with a user
router.get('/conversation/:targetUserId', authenticate, chatController.getConversation);

// Get messages for a thread
router.get('/messages/:threadId', authenticate, chatController.getMessages);

// Send a message
router.post('/messages/:threadId', authenticate, chatController.sendMessage);

// Mark messages as read
router.post('/messages/:threadId/read', authenticate, chatController.markAsRead);

// Get total unread count
router.get('/unread-count', authenticate, chatController.getUnreadCount);

// Search users to start new chat
router.get('/search-users', authenticate, chatController.searchUsers);

module.exports = router;
