import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import AppError from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get or create a conversation between two users
// @route   POST /api/chat/conversations
// @access  Private
export const getOrCreateConversation = catchAsync(async (req, res, next) => {
  const { participantId, rideId } = req.body;

  if (participantId === req.user.id) {
    return next(new AppError('Cannot create conversation with yourself', 400));
  }

  // Check if conversation already exists between these two users
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, participantId] },
  }).populate('participants', 'name profilePhoto');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user.id, participantId],
      ride: rideId || undefined,
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name profilePhoto');
  }

  res.json({ success: true, data: conversation });
});

// @desc    Get all conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private
export const getMyConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  })
    .populate('participants', 'name profilePhoto')
    .populate('ride', 'origin destination departureDate')
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: conversations });
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;

  // Verify user is a participant
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user.id
  );
  if (!isParticipant) {
    return next(new AppError('Not authorized to view this conversation', 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'name profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Mark messages as read by current user
  await Message.updateMany(
    {
      conversation: req.params.id,
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id },
    },
    { $addToSet: { readBy: req.user.id } }
  );

  // Reset unread count for this user
  conversation.unreadCount.set(req.user.id, 0);
  await conversation.save();

  res.json({ success: true, data: messages.reverse() });
});

// @desc    Send a message in a conversation
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user.id
  );
  if (!isParticipant) {
    return next(new AppError('Not authorized', 403));
  }

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user.id,
    content,
    readBy: [req.user.id],
  });

  // Update conversation's last message
  conversation.lastMessage = content.substring(0, 100);
  conversation.lastMessageAt = new Date();

  // Increment unread count for other participants
  for (const participantId of conversation.participants) {
    if (participantId.toString() !== req.user.id) {
      const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
      conversation.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  }
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name profilePhoto');

  res.status(201).json({ success: true, data: populatedMessage });
});
