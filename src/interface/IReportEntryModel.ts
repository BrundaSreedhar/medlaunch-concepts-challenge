export interface IReportEntryModel {
    reportEntryId: string;
    createdBy: string; // User who created the report entry
    reportId: string;
    text: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
  