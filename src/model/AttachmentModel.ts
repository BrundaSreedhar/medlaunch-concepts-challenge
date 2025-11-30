import { IAttachmentModel } from "../interface/IAttachmentModel";
import { DBUtil } from "../utils/DatabaseUtil";
import { IFileStorage, FileStorageFactory } from "../service/FileStorageService";

export class AttachmentModel {
  private storage: IFileStorage;
  private readonly filename = 'attachments.json';

  constructor() {
    this.storage = FileStorageFactory.create();
  }

  /**
   * Create a new attachment record and save the file
   */
  public async createAttachment(
    reportId: string,
    attachmentData: Partial<IAttachmentModel>
  ): Promise<IAttachmentModel> {
    // Verify report exists
    const reports = await DBUtil.readFile('reports.json');
    const report = reports.find((r: any) => r.reportId === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const attachments = await DBUtil.readFile(this.filename);

    // Create attachment record
    const attachment: IAttachmentModel = {
      attachmentId: attachmentData.attachmentId || '',
      reportId: reportId,
      attachmentUrl: attachmentData.attachmentUrl || '',
      attachmentType: attachmentData.attachmentType || '',
      attachmentName: attachmentData.attachmentName || '',
      attachmentSize: attachmentData.attachmentSize || 0,
      createdAt: attachmentData.createdAt || new Date().toISOString()
    };

    attachments.push(attachment);
    await DBUtil.writeFile(this.filename, attachments);

    return attachment;
  }

  /**
   * Retrieve all attachments for a report
   */
  public async retrieveAttachmentsByReport(reportId: string): Promise<IAttachmentModel[]> {
    const attachments = await DBUtil.readFile(this.filename);
    return attachments.filter(
      (att: IAttachmentModel) => att.reportId === reportId
    );
  }

  /**
   * Retrieve a specific attachment by ID
   */
  public async retrieveAttachment(attachmentId: string): Promise<IAttachmentModel | null> {
    const attachments = await DBUtil.readFile(this.filename);
    return attachments.find(
      (att: IAttachmentModel) => att.attachmentId === attachmentId
    ) || null;
  }

  /**
   * Delete an attachment and its file
   */
  public async deleteAttachment(attachmentId: string): Promise<void> {
    const attachments = await DBUtil.readFile(this.filename);
    const attachmentIndex = attachments.findIndex(
      (att: IAttachmentModel) => att.attachmentId === attachmentId
    );

    if (attachmentIndex === -1) {
      throw new Error('Attachment not found');
    }

    const attachment = attachments[attachmentIndex];

    // Delete the physical file
    try {
      await this.storage.deleteFile(attachment.attachmentUrl);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Remove from database
    attachments.splice(attachmentIndex, 1);
    await DBUtil.writeFile(this.filename, attachments);
  }

  /**
   * Get file buffer for download
   */
  public async getFileBuffer(attachmentUrl: string): Promise<Buffer> {
    return await this.storage.getFile(attachmentUrl);
  }
}
