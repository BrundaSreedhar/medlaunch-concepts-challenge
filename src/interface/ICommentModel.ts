export interface ICommentModel {
  commentId: string;
  reportId: string;
  commentedBy: string; // User who made the comment
  text: string; // Comment content
  createdAt: string | Date;
  updatedAt?: string | Date;
}

