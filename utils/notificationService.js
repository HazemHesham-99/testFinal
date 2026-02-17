// const Notification = require("../models/Notification")

async function createNotification(data) {
    const notification = await Notification.create(data)
    return notification
}

async function markAsRead(notificationId) {
    return Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    )
}

async function getUserNotifications(userId) {
    return Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "username name")
}

async function getUnreadCount(userId) {
    return Notification.countDocuments({
        recipient: userId,
        isRead: false
    })
}

module.exports = {
    createNotification,
    markAsRead,
    getUserNotifications,
    getUnreadCount
}
