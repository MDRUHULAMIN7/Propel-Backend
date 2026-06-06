import { ActivityLog } from '../modules/activityLog/activityLog.model.js';
import { LogActivityInput } from '../modules/activityLog/activityLog.interface.js';
import { Types } from 'mongoose';

const logActivity = async (data: LogActivityInput): Promise<void> => {
  try {
    await ActivityLog.create({
      action: data.action,
      performedBy: new Types.ObjectId(data.performedBy.toString()),
      targetType: data.targetType,
      targetId: new Types.ObjectId(data.targetId.toString()),
      projectId: data.projectId ? new Types.ObjectId(data.projectId.toString()) : null,
      description: data.description,
      metadata: data.metadata || {},
    });
  } catch (error) {
    console.error('[ActivityLog] Failed to log activity:', error);
  }
};

export default logActivity;
