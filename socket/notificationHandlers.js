// socket/notificationHandlers.js
const { Notification } = require('../modle/Notification')
const { User } = require("../modle/user")
const { getUser } = require('./userStore')

module.exports = function notificationHandlers(io, socket) {
    const { userId, username } = socket

    // ===== FETCH NOTIFICATIONS =====
    socket.on('notification:fetch', async () => {
        try {
            console.log(`📋 User ${userId} fetching notifications`)
            
            const notifications = await Notification.find({ recipient: userId })
                .populate('sender', 'username profilePicture')
                .sort({ createdAt: -1 })
                .limit(50)
                
                        
            socket.emit('notification:list', notifications)
            
            const unreadCount = notifications.filter(n => !n.isRead).length
            socket.emit('notification:count', { count: unreadCount })
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    })

    // ===== MARK NOTIFICATION AS READ =====
    socket.on('notification:read', async ({ notificationId }) => {
        try {
            
            await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { isRead: true }
            )
            
            // Get updated unread count
            const unreadCount = await Notification.countDocuments({ 
                recipient: userId, 
                isRead: false 
            })
            
            socket.emit('notification:count', { count: unreadCount })
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    })

    // ===== MARK ALL AS READ =====
    socket.on('notification:read-all', async () => {
        try {
            
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { isRead: true }
            )
            
            socket.emit('notification:count', { count: 0 })
            
            // Refresh notifications list
            const notifications = await Notification.find({ recipient: userId })
                .populate('sender', 'username profilePicture')
                .sort({ createdAt: -1 })
                .limit(50)
                .lean()
            
            socket.emit('notification:list', notifications)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    })

    // Create the helpers object
    const helpers = {
        // Create notification
        createNotification: async (recipientId, notificationData) => {
                 const senderId = notificationData.sender  // Get sender from data
            try {
    
                // Don't notify yourself
                if (recipientId.toString() === senderId.toString()) {
                    console.log('⏭️ Skipping self-notification')
                    return null
                }

                // Create notification in database
                const notification = new Notification({
                    recipient: recipientId,
                    sender: senderId,
                    type: notificationData.type,
                    message: notificationData.message,
                    postId: notificationData.postId || null,
                    isRead: false
                })

                // Saving notification to database
                await notification.save()

                // Populate for sending
                const populatedNotification = await Notification.findById(notification._id)
                    .populate('sender', 'name profilePicture')

                // Get recipient's socket
                const recipient = getUser(recipientId)
                
                if (recipient) {
                    
                    // Send real-time notification
                    io.to(recipient.socketId).emit('notification:new', populatedNotification)
                    
                    // Update unread count
                    const unreadCount = await Notification.countDocuments({ 
                        recipient: recipientId, 
                        isRead: false 
                    })
                    
                    io.to(recipient.socketId).emit('notification:count', { count: unreadCount })
                } else {
                    console.log(`⏳ User ${recipientId} is offline, notification saved for later`)
                }

                return populatedNotification
            } catch (error) {
                console.error('❌ Error in createNotification:', error)
                throw error
            }
        }
    }

    // Attach helpers to socket
    socket.notificationHelpers = helpers
    
    return helpers
}