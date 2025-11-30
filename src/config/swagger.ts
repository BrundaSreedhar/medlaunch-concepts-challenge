import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import { swaggerPaths } from "./swagger-docs";

export function setupSwagger(app: Application) {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "MedLaunch Concepts Backend Coding Challenge",
      version: "1.0.0",
      description: "API for managing reports, comments, entries, attachments, and users",
      contact: {
        name: "API Support"
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: "Development server"
      }
    ],
    paths: swaggerPaths,
    components: {
      schemas: {
        Report: {
          type: "object",
          properties: {
            reportId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            createdBy: { type: "string" },
            owner: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
            reportEntries: { type: "array", items: { $ref: "#/components/schemas/ReportEntry" } },
            attachments: { type: "array", items: { $ref: "#/components/schemas/Attachment" } }
          }
        },
        Comment: {
          type: "object",
          properties: {
            commentId: { type: "string" },
            reportId: { type: "string" },
            commentedBy: { type: "string" },
            text: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        ReportEntry: {
          type: "object",
          properties: {
            reportEntryId: { type: "string" },
            reportId: { type: "string" },
            text: { type: "string" },
            createdBy: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Attachment: {
          type: "object",
          properties: {
            attachmentId: { type: "string" },
            reportId: { type: "string" },
            attachmentUrl: { type: "string" },
            attachmentType: { type: "string" },
            attachmentName: { type: "string" },
            attachmentSize: { type: "number" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        User: {
          type: "object",
          properties: {
            userId: { type: "string" },
            email: { type: "string" },
            username: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["admin", "viewer", "editor"] },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    }
  };

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}