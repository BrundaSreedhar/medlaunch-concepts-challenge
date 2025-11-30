import { IReportModel } from "../interface/IReportModel"
import { IReportEntryModel } from "../interface/IReportEntryModel"
import { ICommentModel } from "../interface/ICommentModel"
import { IAttachmentModel } from "../interface/IAttachmentModel"
import { DBUtil } from "../utils/DatabaseUtil";

class ReportModel {
  private readonly filename = 'reports.json';

  /**
   * Retrieve all reports with nested data
   */
  public async retrieveAllReports(): Promise<IReportModel[]> {
    const reports = await DBUtil.readFile(this.filename);
    return reports.map((report: IReportModel) => ({
      ...report,
      comments: report.comments || [],
      reportEntries: report.reportEntries || [],
      attachments: report.attachments || []
    }));
  }

  /**
   * Retrieve a specific report by reportId with embedded data
   */
  public async retrieveReport(reportId: string): Promise<IReportModel | null> {
    const reports = await DBUtil.readFile(this.filename);
    const report = reports.find((r: IReportModel) => r.reportId === reportId);
    
    if (!report) {
      return null;
    }

    return {
      ...report,
      comments: report.comments || [],
      reportEntries: report.reportEntries || [],
      attachments: report.attachments || []
    };
  }

  /**
   * Create a new report
   */
  public async createReport(report: IReportModel): Promise<IReportModel> {
    const reports = await DBUtil.readFile(this.filename);
    const newReport: IReportModel = {
      ...report,
      comments: [],
      reportEntries: [],
      attachments: []
    };
    reports.push(newReport);
    await DBUtil.writeFile(this.filename, reports);
    return newReport;
  }

  /**
   * Update a report
   */
  public async updateReport(reportId: string, reportData: Partial<IReportModel>): Promise<IReportModel> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const existingReport = reports[reportIndex];
    const updatedReport: IReportModel = {
      ...existingReport,
      ...reportData,
      reportId: existingReport.reportId,
      updatedAt: new Date().toISOString(),
      comments: reportData.comments !== undefined ? reportData.comments : existingReport.comments || [],
      reportEntries: reportData.reportEntries !== undefined ? reportData.reportEntries : existingReport.reportEntries || [],
      attachments: reportData.attachments !== undefined ? reportData.attachments : existingReport.attachments || []
    };

    reports[reportIndex] = updatedReport;
    await DBUtil.writeFile(this.filename, reports);
    return updatedReport;
  }

  /**
   * Delete a report
   */
  public async deleteReport(reportId: string): Promise<void> {
    const reports = await DBUtil.readFile(this.filename);
    const filteredReports = reports.filter((report: IReportModel) => report.reportId !== reportId);
    await DBUtil.writeFile(this.filename, filteredReports);
  }

  /**
   * Add a comment to a report
   */
  public async addComment(reportId: string, comment: ICommentModel): Promise<ICommentModel> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.comments) {
      report.comments = [];
    }
    
    report.comments.push(comment);
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
    return comment;
  }

  /**
   * Update a comment in a report
   */
  public async updateComment(reportId: string, commentId: string, commentData: Partial<ICommentModel>): Promise<ICommentModel> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.comments) {
      throw new Error('Comment not found');
    }

    const commentIndex = report.comments.findIndex((c: ICommentModel) => c.commentId === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    report.comments[commentIndex] = {
      ...report.comments[commentIndex],
      ...commentData,
      commentId: report.comments[commentIndex].commentId,
      reportId: reportId
    };
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
    return report.comments[commentIndex];
  }

  /**
   * Delete a comment from a report
   */
  public async deleteComment(reportId: string, commentId: string): Promise<void> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.comments) {
      throw new Error('Comment not found');
    }

    const commentIndex = report.comments.findIndex((c: ICommentModel) => c.commentId === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    report.comments.splice(commentIndex, 1);
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
  }

  /**
   * Add a report entry to a report
   */
  public async addReportEntry(reportId: string, entry: IReportEntryModel): Promise<IReportEntryModel> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.reportEntries) {
      report.reportEntries = [];
    }
    
    report.reportEntries.push(entry);
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
    return entry;
  }

  /**
   * Update a report entry in a report
   */
  public async updateReportEntry(reportId: string, entryId: string, entryData: Partial<IReportEntryModel>): Promise<IReportEntryModel> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.reportEntries) {
      throw new Error('Report entry not found');
    }

    const entryIndex = report.reportEntries.findIndex((e: IReportEntryModel) => e.reportEntryId === entryId);
    if (entryIndex === -1) {
      throw new Error('Report entry not found');
    }

    report.reportEntries[entryIndex] = {
      ...report.reportEntries[entryIndex],
      ...entryData,
      reportEntryId: report.reportEntries[entryIndex].reportEntryId,
      reportId: reportId
    };
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
    return report.reportEntries[entryIndex];
  }

  /**
   * Delete a report entry from a report
   */
  public async deleteReportEntry(reportId: string, entryId: string): Promise<void> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.reportEntries) {
      throw new Error('Report entry not found');
    }

    const entryIndex = report.reportEntries.findIndex((e: IReportEntryModel) => e.reportEntryId === entryId);
    if (entryIndex === -1) {
      throw new Error('Report entry not found');
    }

    report.reportEntries.splice(entryIndex, 1);
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
  }

  /**
   * Add an attachment to a report
   */
  public async addAttachment(reportId: string, attachment: IAttachmentModel): Promise<IAttachmentModel> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.attachments) {
      report.attachments = [];
    }
    
    report.attachments.push(attachment);
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
    return attachment;
  }

  /**
   * Delete an attachment from a report
   */
  public async deleteAttachment(reportId: string, attachmentId: string): Promise<void> {
    const reports = await DBUtil.readFile(this.filename);
    const reportIndex = reports.findIndex((r: IReportModel) => r.reportId === reportId);
    
    if (reportIndex === -1) {
      throw new Error('Report not found');
    }

    const report = reports[reportIndex];
    if (!report.attachments) {
      throw new Error('Attachment not found');
    }

    const attachmentIndex = report.attachments.findIndex((a: IAttachmentModel) => a.attachmentId === attachmentId);
    if (attachmentIndex === -1) {
      throw new Error('Attachment not found');
    }

    report.attachments.splice(attachmentIndex, 1);
    report.updatedAt = new Date().toISOString();
    
    await DBUtil.writeFile(this.filename, reports);
  }
}

export { ReportModel };
