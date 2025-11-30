export interface IAttachmentModel {
    attachmentId: string;
    reportId: string;
    attachmentUrl: string; //where the attachment is stored
    attachmentType: string; //the type of the attachment
    attachmentName: string; //the name of the attachment
    attachmentSize: number; //the size of the attachment
    createdAt: string;
}