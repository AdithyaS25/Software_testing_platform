import { NotificationType } from "@prisma/client";
interface CreateNotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}
export declare function createNotification(payload: CreateNotificationPayload): Promise<void>;
export declare function notifyBugAssigned(opts: {
    assignedToId: string;
    bugId: string;
    bugTitle: string;
    projectId: string;
    internalId: string;
}): Promise<void>;
export declare function notifyBugStatusChanged(opts: {
    reporterId: string;
    assignedToId: string | null;
    bugId: string;
    bugTitle: string;
    newStatus: string;
    projectId: string;
    internalId: string;
}): Promise<void>;
export declare function notifyTestRunAssigned(opts: {
    assignedToId: string;
    testRunName: string;
    projectId: string;
    testRunId: string;
}): Promise<void>;
export declare function notifyCommentMention(opts: {
    mentionedUserId: string;
    authorEmail: string;
    bugId: string;
    bugTitle: string;
    projectId: string;
    internalId: string;
}): Promise<void>;
export declare function notifyRetestRequested(opts: {
    testerId: string;
    bugId: string;
    bugTitle: string;
    projectId: string;
    internalId: string;
}): Promise<void>;
export {};
//# sourceMappingURL=notification.service.d.ts.map