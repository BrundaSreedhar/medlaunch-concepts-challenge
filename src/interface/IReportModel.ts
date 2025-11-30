import { ICommentModel } from "./ICommentModel";
import { IReportEntryModel } from "./IReportEntryModel";
import { IAttachmentModel } from "./IAttachmentModel";

interface IReportModel {
    reportId: string;
    title: string;
    description: string;
    createdBy: string;
    owner: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    comments?: ICommentModel[];
    reportEntries?: IReportEntryModel[];
    attachments?: IAttachmentModel[];
}

export { IReportModel };