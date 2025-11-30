/**
 * Swagger API Documentation
 *
 */

export const swaggerPaths = {
  '/report': {
    post: {
      summary: 'Create a new report',
      tags: ['Reports'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'description'],
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                createdBy: { type: 'string' },
                owner: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Report created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reportId: { type: 'string' }
                }
              }
            }
          }
        },
        '500': {
          description: 'Server error',
          content: {
            'application/json': {
              schema: { $ref: '#/interface/schemas/Error' }
            }
          }
        }
      }
    },
    get: {
      summary: 'Get all reports',
      tags: ['Reports'],
      responses: {
        '200': {
          description: 'List of all reports with embedded data',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Report' }
              }
            }
          }
        },
        '500': {
          description: 'Server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/report/{reportId}': {
    get: {
      summary: 'Get a specific report by ID',
      tags: ['Reports'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' },
          description: 'The report ID'
        }
      ],
      responses: {
        '200': {
          description: 'Report details with embedded comments, entries, and attachments',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Report' }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    },
    put: {
      summary: 'Update a report',
      tags: ['Reports'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                owner: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Report updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Report' }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    },
    delete: {
      summary: 'Delete a report',
      tags: ['Reports'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Report deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reportId: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/entry': {
    post: {
      summary: 'Add a report entry to a report',
      tags: ['Report Entries'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['text'],
              properties: {
                text: { type: 'string' },
                createdBy: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'Report entry created successfully' },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    },
    get: {
      summary: 'Get all report entries for a report',
      tags: ['Report Entries'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'List of report entries',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ReportEntry' }
              }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/entry/{entryId}': {
    get: {
      summary: 'Get a specific report entry',
      tags: ['Report Entries'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'entryId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Report entry details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportEntry' }
            }
          }
        },
        '404': { description: 'Report or entry not found' },
        '500': { description: 'Server error' }
      }
    },
    put: {
      summary: 'Update a report entry',
      tags: ['Report Entries'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'entryId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                createdBy: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Report entry updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportEntry' }
            }
          }
        },
        '404': { description: 'Report or entry not found' },
        '500': { description: 'Server error' }
      }
    },
    delete: {
      summary: 'Delete a report entry',
      tags: ['Report Entries'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'entryId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': { description: 'Report entry deleted successfully' },
        '404': { description: 'Report or entry not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/comment': {
    post: {
      summary: 'Add a comment to a report',
      tags: ['Comments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['text'],
              properties: {
                text: { type: 'string' },
                commentedBy: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Comment created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Comment' }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    },
    get: {
      summary: 'Get all comments for a report',
      tags: ['Comments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'List of comments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  comments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Comment' }
                  }
                }
              }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/comment/{commentId}': {
    get: {
      summary: 'Get a specific comment',
      tags: ['Comments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'commentId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Comment details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Comment' }
            }
          }
        },
        '404': { description: 'Report or comment not found' },
        '500': { description: 'Server error' }
      }
    },
    put: {
      summary: 'Update a comment',
      tags: ['Comments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'commentId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                text: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Comment updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Comment' }
            }
          }
        },
        '404': { description: 'Report or comment not found' },
        '500': { description: 'Server error' }
      }
    },
    delete: {
      summary: 'Delete a comment',
      tags: ['Comments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'commentId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': { description: 'Comment deleted successfully' },
        '404': { description: 'Report or comment not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/attachment': {
    post: {
      summary: 'Upload an attachment to a report',
      tags: ['Attachments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Attachment uploaded successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Attachment' }
            }
          }
        },
        '400': { description: 'Invalid file or validation error' },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    },
    get: {
      summary: 'Get all attachments for a report',
      tags: ['Attachments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'List of attachments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  attachments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Attachment' }
                  }
                }
              }
            }
          }
        },
        '404': { description: 'Report not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/attachment/{attachmentId}/token': {
    get: {
      summary: 'Generate a download token for an attachment',
      tags: ['Attachments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'attachmentId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'query',
          name: 'expires',
          schema: {
            type: 'integer',
            default: 60
          },
          description: 'Token expiration time in minutes'
        }
      ],
      responses: {
        '200': {
          description: 'Token generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  expiresIn: { type: 'integer' },
                  downloadUrl: { type: 'string' }
                }
              }
            }
          }
        },
        '404': { description: 'Report or attachment not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/attachment/{attachmentId}/download': {
    get: {
      summary: 'Download an attachment using a token',
      tags: ['Attachments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'attachmentId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'query',
          name: 'token',
          required: true,
          schema: { type: 'string' },
          description: 'Download token obtained from token endpoint'
        }
      ],
      responses: {
        '200': {
          description: 'File download',
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        '400': { description: 'Token is required' },
        '401': { description: 'Invalid or expired token' },
        '403': { description: 'Token does not match request' },
        '404': { description: 'Report or attachment not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/report/{reportId}/attachment/{attachmentId}': {
    delete: {
      summary: 'Delete an attachment',
      tags: ['Attachments'],
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' }
        },
        {
          in: 'path',
          name: 'attachmentId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': { description: 'Attachment deleted successfully' },
        '404': { description: 'Report or attachment not found' },
        '500': { description: 'Server error' }
      }
    }
  },
  '/user': {
    post: {
      summary: 'Create a new user',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'role'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email'
                },
                username: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: {
                  type: 'string',
                  enum: ['admin', 'viewer', 'editor']
                },
                isActive: { type: 'boolean' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        '400': { description: 'Invalid input' },
        '409': { description: 'User with email already exists' },
        '500': { description: 'Server error' }
      }
    },
    get: {
      summary: 'Get all users',
      tags: ['Users'],
      responses: {
        '200': {
          description: 'List of all users',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  users: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        },
        '500': { description: 'Server error' }
      }
    }
  },
  '/user/{userId}': {
    get: {
      summary: 'Get a specific user by ID',
      tags: ['Users'],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'User details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        '404': { description: 'User not found' },
        '500': { description: 'Server error' }
      }
    }
  }
};

