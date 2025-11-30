import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import multer from 'multer';
import { ReportModel } from './model/ReportModel';
import { UserModel } from './model/UserModel';
import { FileValidator, DEFAULT_FILE_CONFIG } from './utils/FileValidator';
import { FileStorageFactory } from './service/FileStorageService';
import { TokenService } from './utils/TokenService';
import { IReportEntryModel } from './interface/IReportEntryModel';
import { IAttachmentModel } from './interface/IAttachmentModel';
import { ICommentModel } from './interface/ICommentModel';
import { setupSwagger } from './config/swagger';

export class App {
  public app: express.Application;

  public Reports: ReportModel;
  public Users: UserModel;
  private fileValidator: FileValidator;
  private tokenService: TokenService;
  private upload: multer.Multer;

  constructor() {
    this.app = express();
    this.fileValidator = new FileValidator();
    this.tokenService = new TokenService();
    
    // Configure multer for in-memory file storage (buffer)
    const storage = multer.memoryStorage();
    this.upload = multer({ 
      storage: storage,
      limits: {
        fileSize: DEFAULT_FILE_CONFIG.maxSizeBytes
      }
    });
    
    this.middlewares();
    this.routes();
    setupSwagger(this.app);
    this.Reports = new ReportModel();
    this.Users = new UserModel();
  }

  private middlewares(): void {
    this.app.use(express.json());
  }

  private routes(): void {
    let router = express.Router();

    router.post('/report', async (req: Request, res: Response) => {
      console.log("Creating a new report");
      let data = req.body;
      const id = crypto.randomBytes(16).toString("hex"); 
      data.reportId = id;
      data.createdAt = new Date().toISOString();
      try {
        console.log("Creating report", data);
        const report = await this.Reports.createReport(data);
        console.log(`Report with ID ${report.reportId} created successfully`);
        res.status(201).json({reportId: report.reportId});
      } catch (error: any) {
        console.log("Failed to create report", error);
        res.status(500).json({ error: error.message || 'Failed to create report' });
      }
    });

    router.get('/report', async (req: Request, res: Response) => {
      try {
        const reports = await this.Reports.retrieveAllReports();
        console.log("Reports retrieved successfully");
        res.status(200).json(reports);
      } catch (error: any) {
        console.log("Failed to retrieve reports", error);
        res.status(500).json({ error: error.message || 'Failed to retrieve reports' });
      }
    });

    router.get('/report/:reportId', async(req: Request, res: Response) => {
      const reportId = req.params.reportId;
      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }
      try {
        const report = await this.Reports.retrieveReport(reportId);
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json(report);
      } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to retrieve report' });
      }
    });

    router.put('/report/:reportId', async(req: Request, res: Response) => {
      const reportId = req.params.reportId;
      const data = req.body;
      data.updatedAt = new Date().toISOString();
      try {
        const report = await this.Reports.updateReport(reportId, data);
        console.log("Report updated successfully");
        res.status(200).json(report);
      } catch (error: any) {
        console.log("Failed to update report", error);
        if (error.message === 'Report not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to update report' });
      }
    });

    router.delete('/report/:reportId', async (req: Request, res: Response) => {
      const { reportId } = req.params;
      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }
      try {
        await this.Reports.deleteReport(reportId);
        res.status(200).json({ reportId: reportId, status: 'success' });
      } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to delete report' });
      }
    });

    // Report Entry routes (embedded in report)
    router.post('/report/:reportId/entry', async (req: Request, res: Response) => {
      const reportId = req.params.reportId;
      const entryData = req.body;
      
      // Generate entry ID
      const entryId = crypto.randomBytes(16).toString('hex');
      const reportEntry: IReportEntryModel = {
        reportEntryId: entryId,
        reportId: reportId,
        text: entryData.text || '',
        createdBy: entryData.createdBy || 'system',
        createdAt: new Date().toISOString()
      };

      try {
        const created = await this.Reports.addReportEntry(reportId, reportEntry);
        console.log(`Report entry ${entryId} created for report ${reportId}`);
        res.status(201).json({reportEntryId: entryId, reportId: reportId});
      } catch (error: any) {
        console.error('Failed to create report entry:', error);
        if (error.message === 'Report not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to create report entry' });
      }
    });

    router.get('/report/:reportId/entry', async (req: Request, res: Response) => {
      const reportId = req.params.reportId;
      try {
        const report = await this.Reports.retrieveReport(reportId);
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json(report.reportEntries || []);
      } catch (error: any) {
        console.error('Failed to retrieve report entries:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve report entries' });
      }
    });

    router.get('/report/:reportId/entry/:entryId', async (req: Request, res: Response) => {
      const { reportId, entryId } = req.params;
      try {
        const report = await this.Reports.retrieveReport(reportId);
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        const entry = (report.reportEntries || []).find((e: IReportEntryModel) => e.reportEntryId === entryId);
        if (!entry) {
          return res.status(404).json({ error: 'Report entry not found' });
        }
        res.status(200).json(entry);
      } catch (error: any) {
        console.error('Failed to retrieve report entry:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve report entry' });
      }
    });

  
    router.put('/report/:reportId/entry/:entryId', async (req: Request, res: Response) => {
      const { reportId, entryId } = req.params;
      const entryData = req.body;

      try {
        const updated = await this.Reports.updateReportEntry(reportId, entryId, entryData);
        console.log(`Report entry ${entryId} updated`);
        res.status(200).json(updated);
      } catch (error: any) {
        console.error('Failed to update report entry:', error);
        if (error.message === 'Report not found' || error.message === 'Report entry not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to update report entry' });
      }
    });

  
    router.delete('/report/:reportId/entry/:entryId', async (req: Request, res: Response) => {
      const { reportId, entryId } = req.params;
      try {
        await this.Reports.deleteReportEntry(reportId, entryId);
        console.log(`Report entry ${entryId} deleted`);
        res.status(200).json({ message: 'Report entry deleted successfully' });
      } catch (error: any) {
        console.error('Failed to delete report entry:', error);
        if (error.message === 'Report not found' || error.message === 'Report entry not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to delete report entry' });
      }
    });

    // Comment routes (embedded in report)
   
    router.post('/report/:reportId/comment', async (req: Request, res: Response) => {
      const reportId = req.params.reportId;
      const commentData = req.body;
      
      // Generate comment ID
      const commentId = crypto.randomBytes(16).toString('hex');
      const comment: ICommentModel = {
        commentId: commentId,
        reportId: reportId,
        commentedBy: commentData.commentedBy || 'anonymous',
        text: commentData.text || '',
        createdAt: new Date().toISOString()
      };

      try {
        const created = await this.Reports.addComment(reportId, comment);
        console.log(`Comment ${commentId} created for report ${reportId}`);
        res.status(201).json(created);
      } catch (error: any) {
        console.error('Failed to create comment:', error);
        if (error.message === 'Report not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to create comment' });
      }
    });

    router.get('/report/:reportId/comment', async (req: Request, res: Response) => {
      const reportId = req.params.reportId;
      try {
        const report = await this.Reports.retrieveReport(reportId);
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json({ comments: report.comments || [] });
      } catch (error: any) {
        console.error('Failed to retrieve comments:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve comments' });
      }
    });

    router.get('/report/:reportId/comment/:commentId', async (req: Request, res: Response) => {
      const { reportId, commentId } = req.params;
      try {
        const report = await this.Reports.retrieveReport(reportId);
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        const comment = (report.comments || []).find((c: ICommentModel) => c.commentId === commentId);
        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment);
      } catch (error: any) {
        console.error('Failed to retrieve comment:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve comment' });
      }
    });

    router.put('/report/:reportId/comment/:commentId', async (req: Request, res: Response) => {
      const { reportId, commentId } = req.params;
      const commentData = req.body;
      
      try {
        const updated = await this.Reports.updateComment(reportId, commentId, commentData);
        console.log(`Comment ${commentId} updated`);
        res.status(200).json(updated);
      } catch (error: any) {
        console.error('Failed to update comment:', error);
        if (error.message === 'Report not found' || error.message === 'Comment not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to update comment' });
      }
    });

    router.delete('/report/:reportId/comment/:commentId', async (req: Request, res: Response) => {
      const { reportId, commentId } = req.params;
      try {
        await this.Reports.deleteComment(reportId, commentId);
        console.log(`Comment ${commentId} deleted`);
        res.status(200).json({ message: 'Comment deleted successfully' });
      } catch (error: any) {
        console.error('Failed to delete comment:', error);
        if (error.message === 'Report not found' || error.message === 'Comment not found') {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to delete comment' });
      }
    });

    // File upload route: POST /report/:reportId/attachment
    router.post('/report/:reportId/attachment', 
      this.upload.single('file'),
      async (req: Request, res: Response) => {
        const reportId = req.params.reportId;
        
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
          // Validate file
          const validation = this.fileValidator.validate(req.file);
          if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
          }

          // Verify report exists
          const report = await this.Reports.retrieveReport(reportId);
          if (!report) {
            return res.status(404).json({ error: 'Report not found' });
          }

          // Save file to storage
          const storage = FileStorageFactory.create();
          const filePath = await storage.saveFile(req.file, reportId);

          // Create attachment record
          const attachmentId = crypto.randomBytes(16).toString('hex');
          const attachmentData: IAttachmentModel = {
            attachmentId: attachmentId,
            reportId: reportId,
            attachmentUrl: filePath,
            attachmentType: req.file.mimetype,
            attachmentName: req.file.originalname,
            attachmentSize: req.file.size,
            createdAt: new Date().toISOString()
          };

          const attachment = await this.Reports.addAttachment(reportId, attachmentData);
          console.log(`Attachment ${attachmentId} created for report ${reportId}`);
          res.status(201).json(attachment);
        } catch (error) {
          console.error('Failed to upload attachment:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to upload attachment' });
          }
        }
      }
    );

    // Get all attachments for a report: GET /report/:reportId/attachment
    router.get('/report/:reportId/attachment', async (req: Request, res: Response) => {
      const reportId = req.params.reportId;
      try {
        const report = await this.Reports.retrieveReport(reportId);
        if (!report) {
          return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json({ attachments: report.attachments || [] });
      } catch (error: any) {
        console.error('Failed to retrieve attachments:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve attachments' });
      }
    });

    // Generate download token: GET /report/:reportId/attachment/:attachmentId/token
    router.get('/report/:reportId/attachment/:attachmentId/token', 
      async (req: Request, res: Response) => {
        const { reportId, attachmentId } = req.params;
        const expirationMinutes = req.query.expires 
          ? parseInt(req.query.expires as string, 10) 
          : 60;

        try {
          // Verify attachment exists and belongs to report
          const report = await this.Reports.retrieveReport(reportId);
          if (!report) {
            return res.status(404).json({ error: 'Report not found' });
          }
          const attachment = (report.attachments || []).find((a: IAttachmentModel) => a.attachmentId === attachmentId);
          if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
          }

          // Generate token
          const token = this.tokenService.generateToken(attachmentId, reportId, expirationMinutes);
          
          res.status(200).json({
            token: token,
            expiresIn: expirationMinutes,
            downloadUrl: `/report/${reportId}/attachment/${attachmentId}/download?token=${token}`
          });
        } catch (error) {
          console.error('Failed to generate token:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate download token' });
          }
        }
      }
    );

    // Download file with token: GET /reports/:reportId/attachments/:attachmentId/download

    router.get('/report/:reportId/attachment/:attachmentId/download',
      async (req: Request, res: Response) => {
        const { reportId, attachmentId } = req.params;
        const token = req.query.token as string;

        if (!token) {
          return res.status(400).json({ error: 'Token is required' });
        }

        try {
          // Validate token
          const payload = this.tokenService.validateToken(token);
          if (!payload) {
            return res.status(401).json({ error: 'Invalid or expired token' });
          }

          // Verify token matches request
          if (payload.attachmentId !== attachmentId || payload.reportId !== reportId) {
            return res.status(403).json({ error: 'Token does not match request' });
          }

          // Retrieve attachment from report
          const report = await this.Reports.retrieveReport(reportId);
          if (!report) {
            return res.status(404).json({ error: 'Report not found' });
          }
          const attachment = (report.attachments || []).find((a: IAttachmentModel) => a.attachmentId === attachmentId);
          if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
          }

          // Get file buffer
          const storage = FileStorageFactory.create();
          const fileBuffer = await storage.getFile(attachment.attachmentUrl);
          
          // Set headers for download
          res.setHeader('Content-Type', attachment.attachmentType);
          res.setHeader('Content-Disposition', `attachment; filename="${attachment.attachmentName}"`);
          res.setHeader('Content-Length', fileBuffer.length);

          // Send file
          res.send(fileBuffer);
        } catch (error) {
          console.error('Failed to download attachment:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download attachment' });
          }
        }
      }
    );

    // Delete attachment: DELETE /reports/:reportId/attachments/:attachmentId
    router.delete('/report/:reportId/attachment/:attachmentId',
      async (req: Request, res: Response) => {
        const { reportId, attachmentId } = req.params;
        try {
          // Get attachment to delete file from storage
          const report = await this.Reports.retrieveReport(reportId);
          if (!report) {
            return res.status(404).json({ error: 'Report not found' });
          }
          const attachment = (report.attachments || []).find((a: IAttachmentModel) => a.attachmentId === attachmentId);
          if (!attachment) {
            return res.status(404).json({ error: 'Attachment not found' });
          }

          // Delete file from storage
          try {
            const storage = FileStorageFactory.create();
            await storage.deleteFile(attachment.attachmentUrl);
          } catch (error) {
            console.error('Error deleting file from storage:', error);
            // Continue with database deletion even if file deletion fails
          }

          // Delete attachment from report
          await this.Reports.deleteAttachment(reportId, attachmentId);
          res.status(200).json({ message: 'Attachment deleted successfully' });
        } catch (error: any) {
          console.error('Failed to delete attachment:', error);
          if (error.message === 'Report not found' || error.message === 'Attachment not found') {
            return res.status(404).json({ error: error.message });
          }
          res.status(500).json({ error: error.message || 'Failed to delete attachment' });
        }
      }
    );

    // User routes
    router.post('/user', async (req: Request, res: Response) => {
      const userData = req.body;
      
      // Generate user ID
      const userId = crypto.randomBytes(16).toString('hex');
      const user = {
        userId: userId,
        email: userData.email,
        username: userData.username || userData.email?.split('@')[0],
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'viewer',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Validate required fields
      if (!user.email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Validate role
      const validRoles = ['admin', 'viewer', 'editor'];
      if (!validRoles.includes(user.role)) {
        return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }

      try {
        const created = await this.Users.createUser(user);
        console.log(`User ${userId} created`);
        res.status(201).json(created);
      } catch (error: any) {
        console.error('Failed to create user:', error);
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to create user' });
      }
    });

    router.get('/user', async (req: Request, res: Response) => {
      try {
        const users = await this.Users.retrieveAllUsers();
        res.status(200).json({ users });
      } catch (error: any) {
        console.error('Failed to retrieve users:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve users' });
      }
    });

    router.get('/user/:userId', async (req: Request, res: Response) => {
      const { userId } = req.params;
      try {
        const user = await this.Users.retrieveUser(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
      } catch (error: any) {
        console.error('Failed to retrieve user:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve user' });
      }
    });
    this.app.use('/', router);
  }
}