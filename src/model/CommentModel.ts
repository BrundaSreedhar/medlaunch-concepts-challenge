import { ICommentModel } from "../interface/ICommentModel";
import { DBUtil } from "../utils/DatabaseUtil";

export class CommentModel {
  private readonly filename = 'comments.json';

  /**
   * Retrieve all comments for a specific report
   */
  public async retrieveCommentsByReport(reportId: string): Promise<ICommentModel[]> {
    const comments = await DBUtil.readFile(this.filename);
    return comments.filter(
      (comment: ICommentModel) => comment.reportId === reportId
    );
  }

  /**
   * Retrieve a specific comment by ID
   */
  public async retrieveComment(commentId: string): Promise<ICommentModel | null> {
    const comments = await DBUtil.readFile(this.filename);
    return comments.find(
      (comment: ICommentModel) => comment.commentId === commentId
    ) || null;
  }

  /**
   * Create a new comment
   */
  public async createComment(comment: ICommentModel): Promise<ICommentModel> {
    // Verify report exists
    const reports = await DBUtil.readFile('reports.json');
    const report = reports.find((r: any) => r.reportId === comment.reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const comments = await DBUtil.readFile(this.filename);

    // Set timestamps
    comment.createdAt = comment.createdAt || new Date().toISOString();

    comments.push(comment);
    await DBUtil.writeFile(this.filename, comments);

    return comment;
  }

  /**
   * Update an existing comment
   */
  public async updateComment(commentId: string, commentData: Partial<ICommentModel>): Promise<ICommentModel> {
    const comments = await DBUtil.readFile(this.filename);
    const commentIndex = comments.findIndex(
      (comment: ICommentModel) => comment.commentId === commentId
    );

    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    // Update comment while preserving ID and reportId
    const existingComment = comments[commentIndex];
    const updatedComment: ICommentModel = {
      ...existingComment,
      ...commentData,
      commentId: existingComment.commentId,
      reportId: existingComment.reportId,
      updatedAt: new Date().toISOString()
    };

    comments[commentIndex] = updatedComment;
    await DBUtil.writeFile(this.filename, comments);

    return updatedComment;
  }

  /**
   * Delete a comment
   */
  public async deleteComment(commentId: string): Promise<void> {
    const comments = await DBUtil.readFile(this.filename);
    const commentIndex = comments.findIndex(
      (comment: ICommentModel) => comment.commentId === commentId
    );

    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    comments.splice(commentIndex, 1);
    await DBUtil.writeFile(this.filename, comments);
  }
}
