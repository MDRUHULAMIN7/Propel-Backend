import { Notification } from '../modules/notification/notification.model.js';
import { SendNotificationInput } from '../modules/notification/notification.interface.js';
import { getIO } from '../socket/index.js';
import { Types } from 'mongoose';

const sendNotification = async (data: SendNotificationInput): Promise<void> => {
  try {
    const notification = await Notification.create({
      recipient: new Types.ObjectId(data.recipientId),
      sender: new Types.ObjectId(data.senderId),
      message: data.message,
      type: data.type,
      relatedProject: data.relatedProjectId
        ? new Types.ObjectId(data.relatedProjectId)
        : null,
      relatedTask: data.relatedTaskId
        ? new Types.ObjectId(data.relatedTaskId)
        : null,
    });

    try {
      const io = getIO();
      if (io) {
        io.to(data.recipientId).emit('notification', {
          _id: notification._id,
          message: notification.message,
          type: notification.type,
          isRead: false,
          relatedProject: notification.relatedProject,
          relatedTask: notification.relatedTask,
          createdAt: notification.createdAt,
        });
      }
    } catch (socketError) {
      console.error('[Socket] Notification emit failed:', socketError);
    }
  } catch (error) {
    console.error('[Notification] Failed to send notification:', error);
  }
};

export default sendNotification;
