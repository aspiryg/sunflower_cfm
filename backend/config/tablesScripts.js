export const userTableScript = `
 IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      BEGIN
        CREATE TABLE Users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(50) NOT NULL,
          email NVARCHAR(100) NOT NULL UNIQUE,
          password NVARCHAR(255) NOT NULL,
          firstName NVARCHAR(50),
          lastName NVARCHAR(50),
          profilePicture NVARCHAR(512) NULL,
          bio NVARCHAR(500) NULL,
          dateOfBirth DATETIME NULL,
          phone NVARCHAR(20) NULL,
          address NVARCHAR(255) NULL,
          city NVARCHAR(100) NULL,
          state NVARCHAR(100) NULL,
          country NVARCHAR(100) NULL,
          postalCode NVARCHAR(20) NULL,
          role NVARCHAR(50) DEFAULT 'user',
          organization NVARCHAR(100),
          isActive BIT DEFAULT 1,
          lastLogin DATETIME NULL,
          isOnline BIT DEFAULT 0,
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE(),
          updatedBy NVARCHAR(100) DEFAULT 'system',
          isVerified BIT NOT NULL DEFAULT 0,
          verificationToken NVARCHAR(255) NULL,
          verificationTokenExpires DATETIME NULL
        );
        
        -- Create indexes for better performance
        CREATE INDEX IX_Users_Email ON Users(email);
        CREATE INDEX IX_Users_Username ON Users(username);
        CREATE INDEX IX_Users_Role ON Users(role);
        CREATE INDEX IX_Users_Organization ON Users(organization);
        
        PRINT '✅ Users table created successfully';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  Users table already exists';
      END
`;

export const additionalScripts = [
  // Example: Create a Sessions table for user authentication
  `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sessions' AND xtype='U')
        BEGIN
          CREATE TABLE Sessions (
            id INT IDENTITY(1,1) PRIMARY KEY,
            userId INT NOT NULL,
            sessionToken NVARCHAR(1000) NOT NULL UNIQUE,
            expiresAt DATETIME NOT NULL,
            createdAt DATETIME DEFAULT GETDATE(),
            refreshToken NVARCHAR(1000) NULL,
            isActive BIT NOT NULL DEFAULT 1,
            refreshTokenExpiresAt DATETIME NULL,
            refreshTokenCreatedAt DATETIME NULL,
            FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IX_Sessions_Token ON Sessions(sessionToken);
          CREATE INDEX IX_Sessions_UserId ON Sessions(userId);
          
          PRINT '✅ Sessions table created successfully';
        END
        ELSE
        BEGIN
          PRINT 'ℹ️  Sessions table already exists';
        END
      `,

  // Example: Create an Audit Log table
  `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
        BEGIN
          CREATE TABLE AuditLogs (
            id INT IDENTITY(1,1) PRIMARY KEY,
            userId INT NULL,
            action NVARCHAR(100) NOT NULL,
            entityType NVARCHAR(50) NOT NULL, -- 'feedback', 'user', 'comment', etc.
            entityId INT NULL,
            oldValues NVARCHAR(MAX) NULL, -- JSON string of old values
            newValues NVARCHAR(MAX) NULL, -- JSON string of new values
            ipAddress NVARCHAR(45) NULL,
            userAgent NVARCHAR(500) NULL,
            createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
            
            FOREIGN KEY (userId) REFERENCES Users(id),
            
            INDEX IX_AuditLog_UserId (userId),
            INDEX IX_AuditLog_EntityType (entityType),
            INDEX IX_AuditLog_EntityId (entityId),
            INDEX IX_AuditLog_CreatedAt (createdAt)
          );

          PRINT '✅ AuditLogs table created successfully';
        END
        ELSE
        BEGIN
          PRINT 'ℹ️  AuditLogs table already exists';
        END
      `,
];

// Feedback Categories table script
export const feedbackCategoriesTableScript = `

  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeedbackCategories' AND xtype='U')
  BEGIN
    CREATE TABLE FeedbackCategories (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1,

      -- Add indexes for performance
      INDEX IX_FeedbackCategories_Name (name)
    );

    PRINT '✅ FeedbackCategories table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  FeedbackCategories table already exists';
  END
`;

// Feedback Status table script
export const feedbackStatusTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeedbackStatus' AND xtype='U')
  BEGIN
    CREATE TABLE FeedbackStatus (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      color NVARCHAR(7) NOT NULL,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1
    );

    PRINT '✅ FeedbackStatus table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  FeedbackStatus table already exists';
  END
`;

// Feedback Priority table script
export const feedbackPriorityTableScript = `

  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeedbackPriority' AND xtype='U')
  BEGIN
    CREATE TABLE FeedbackPriority (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      color NVARCHAR(7) NOT NULL,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1
    );

    PRINT '✅ FeedbackPriority table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  FeedbackPriority table already exists';
  END
`;

// Regions table script
export const regionsTableScript = `

  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Regions' AND xtype='U')
  BEGIN
    CREATE TABLE Regions (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1,

      -- Add indexes for performance
      INDEX IX_Regions_Name (name),
    );

    PRINT '✅ Regions table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Regions table already exists';
  END
`;

// Governerates table script
export const governeratesTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Governerates' AND xtype='U')
  BEGIN
    CREATE TABLE Governerates (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      regionId INT NOT NULL,
      isActive BIT NOT NULL DEFAULT 1,

      -- Foreign key to Regions table
      FOREIGN KEY (regionId) REFERENCES Regions(id) ON DELETE CASCADE,

      -- Add indexes for performance
      INDEX IX_Governerates_Name (name),
      INDEX IX_Governerates_RegionId (regionId)
    );

    PRINT '✅ Governerates table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Governerates table already exists';
  END
`;

// Communities table script
export const communitiesTableScript = `

  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Communities' AND xtype='U')
  BEGIN
    CREATE TABLE Communities (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      governerateId INT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1,

      -- Foreign key to Governerates table
      FOREIGN KEY (governerateId) REFERENCES Governerates(id) ON DELETE CASCADE,

      -- Add indexes for performance
      INDEX IX_Communities_Name (name),
      INDEX IX_Communities_GovernerateId (governerateId)
    );

    PRINT '✅ Communities table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Communities table already exists';
  END
`;

// Feedback Channels table script
export const feedbackChannelsTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeedbackChannels' AND xtype='U')
  BEGIN
    CREATE TABLE FeedbackChannels (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1
    );

    PRINT '✅ FeedbackChannels table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  FeedbackChannels table already exists';
  END
`;

// Provider Types table script
export const providerTypesTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProviderTypes' AND xtype='U')
  BEGIN
    CREATE TABLE ProviderTypes (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1
    );

    PRINT '✅ ProviderTypes table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  ProviderTypes table already exists';
  END
`;

// Programmes table script
export const programmesTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Programmes' AND xtype='U')
  BEGIN
    CREATE TABLE Programmes (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1
    );

    PRINT '✅ Programmes table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Programmes table already exists';
  END
`;

// Projects table script
export const projectsTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
  BEGIN
    CREATE TABLE Projects (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      programmeId INT NULL,
      isActive BIT NOT NULL DEFAULT 1,

      -- Foreign key to Programmes table
      FOREIGN KEY (programmeId) REFERENCES Programmes(id) ON DELETE SET NULL
    );

    PRINT '✅ Projects table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Projects table already exists';
  END
`;

// Activities table script
export const activitiesTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Activities' AND xtype='U')
  BEGIN
    CREATE TABLE Activities (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL UNIQUE,
      arabicName NVARCHAR(100) NULL,
      description NVARCHAR(255) NULL,
      arabicDescription NVARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      projectId INT NULL,
      isActive BIT NOT NULL DEFAULT 1,

      -- Foreign key to Projects table
      FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE SET NULL
    );

    PRINT '✅ Activities table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Activities table already exists';
  END
`;

// Feedback table script
export const feedbackTableScript = `
 IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Feedback' AND xtype='U')
      BEGIN
        CREATE TABLE Feedback (
          id INT IDENTITY(1,1) PRIMARY KEY,
          feedbackNumber NVARCHAR(20) NOT NULL UNIQUE,
          feedbackDate DATETIME NOT NULL DEFAULT GETDATE(),
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX) NOT NULL,
          category INT NOT NULL,
          priority NVARCHAR(10) NOT NULL,
          status NVARCHAR(20) NOT NULL,
          feedbackChannel INT NOT NULL,
          impactDescription NVARCHAR(MAX) NULL,

          -- Related Programme or Project
          programmeId INT NULL,
          isProjectRelated BIT NOT NULL DEFAULT 0,
          projectId INT NULL,
          activityId INT NULL,

          -- Feedback Provider details
          providerType INT NULL,
          individualProviderGender NVARCHAR(50) NULL, 
          individualProviderAgeGroup NVARCHAR(20) NULL, 
          individualProviderDisabilityStatus NVARCHAR(20) NULL,
          groupProviderNumberOfIndividuals INT NULL, 
          groupProviderGenderComposition NVARCHAR(50) NULL,
          dataSharingConsent BIT NOT NULL DEFAULT 0,
          consentToFollowUp BIT NOT NULL DEFAULT 0,
          followUpContactMethod NVARCHAR(50) NULL,
          providerName NVARCHAR(255) NULL, 
          providerEmail NVARCHAR(255) NULL, 
          providerPhone NVARCHAR(20) NULL, 
          providerOrganization NVARCHAR(100) NULL,
          providerAddress NVARCHAR(255) NULL,
          
          -- Data Entry info and confirmation
          submittedBy INT NULL,
          submittedAt DATETIME NOT NULL DEFAULT GETDATE(),
          submittedByInitials NVARCHAR(10) NULL,
          submittedByConfirmation BIT NOT NULL DEFAULT 0,
          submittedByComments NVARCHAR(MAX) NULL,

          -- Assignment Information
          assignedTo INT NULL,
          assignedBy INT NULL,
          assignedAt DATETIME NULL,

          -- Location
          community INT NULL,
          location NVARCHAR(255) NULL,
          latitude FLOAT NULL,
          longitude FLOAT NULL,

          -- Additional fields
          tags NVARCHAR(512) NULL,
          attachments NVARCHAR(MAX) NULL,
          
          -- data privacy and security
          isSensitive BIT NOT NULL DEFAULT 0,
          isAnonymized BIT NOT NULL DEFAULT 0,
          isPublic BIT NOT NULL DEFAULT 0,
          privacyPolicyAccepted BIT NOT NULL DEFAULT 0,

          -- Audit fields
          createdAt DATETIME NOT NULL DEFAULT GETDATE(),
          createdBy INT NOT NULL DEFAULT 1, -- Default to system user
          updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
          updatedBy INT NOT NULL DEFAULT 1, -- Default to system user
          isActive BIT NOT NULL DEFAULT 1,

          -- Foreign key constraints
          FOREIGN KEY (category) REFERENCES FeedbackCategories(id) ON DELETE CASCADE,
          FOREIGN KEY (feedbackChannel) REFERENCES FeedbackChannels(id) ON DELETE CASCADE,
          FOREIGN KEY (programmeId) REFERENCES Programmes(id) ON DELETE SET NULL,
          FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE SET NULL,
          FOREIGN KEY (activityId) REFERENCES Activities(id) ON DELETE SET NULL,
          FOREIGN KEY (community) REFERENCES Communities(id) ON DELETE SET NULL,
          FOREIGN KEY (submittedBy) REFERENCES Users(id) ON DELETE SET NULL,
          FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          FOREIGN KEY (assignedBy) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          FOREIGN KEY (submittedBy) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          FOREIGN KEY (updatedBy) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          FOREIGN KEY (providerType) REFERENCES ProviderTypes(id) ON DELETE SET NULL,

          -- Indexes for performance
          INDEX IX_Feedback_Title (title),
          INDEX IX_Feedback_FeedbackNumber (feedbackNumber),
          INDEX IX_Feedback_Category (category),
          INDEX IX_Feedback_Priority (priority),
          INDEX IX_Feedback_Status (status),
          INDEX IX_Feedback_FeedbackChannel (feedbackChannel),
          INDEX IX_Feedback_ProgrammeId (programmeId),
          INDEX IX_Feedback_ProjectId (projectId),
          INDEX IX_Feedback_ActivityId (activityId),
          INDEX IX_Feedback_Community (community),
          INDEX IX_Feedback_SubmittedBy (submittedBy),
          INDEX IX_Feedback_AssignedTo (assignedTo),
          INDEX IX_Feedback_AssignedBy (assignedBy),
          INDEX IX_Feedback_CreatedBy (createdBy),
          INDEX IX_Feedback_UpdatedBy (updatedBy),
          INDEX IX_Feedback_ProviderType (providerType)
        );
        
        PRINT '✅ Feedback table created successfully';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  Feedback table already exists';
      END
`;

// Feedback History table script
export const feedbackHistoryTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeedbackHistory' AND xtype='U')
  BEGIN
    CREATE TABLE FeedbackHistory (
      id INT IDENTITY(1,1) PRIMARY KEY,
      feedbackId INT NOT NULL,
      status NVARCHAR(20) NOT NULL,
      assignedTo INT NULL,
      updatedBy INT NOT NULL,
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      comments NVARCHAR(MAX) NULL,

      -- Foreign key constraints
      FOREIGN KEY (feedbackId) REFERENCES Feedback(id) ON DELETE CASCADE,
      FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
      FOREIGN KEY (updatedBy) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,

      -- Indexes for performance
      INDEX IX_FeedbackHistory_FeedbackId (feedbackId),
      INDEX IX_FeedbackHistory_Status (status),
      INDEX IX_FeedbackHistory_UpdatedAt (updatedAt)
    );

    PRINT '✅ FeedbackHistory table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  FeedbackHistory table already exists';
  END
`;

// Comments table script
export const commentsTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Comments' AND xtype='U')
  BEGIN
    CREATE TABLE Comments (
      id INT IDENTITY(1,1) PRIMARY KEY,
      feedbackId INT NOT NULL,
      comment NVARCHAR(MAX) NOT NULL,
      isInternal BIT NOT NULL DEFAULT 1,

      -- User details
      createdBy INT NOT NULL DEFAULT 1, -- Default to system user
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
      isActive BIT NOT NULL DEFAULT 1,

      -- Foreign key constraints
      FOREIGN KEY (feedbackId) REFERENCES Feedback(id) ON DELETE CASCADE,
      FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,

      -- Indexes for performance
      INDEX IX_Comments_FeedbackId (feedbackId),
      INDEX IX_Comments_CreatedAt (createdAt)
    );

    PRINT '✅ Comments table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Comments table already exists';
  END
`;

// Notifications table script
export const notificationsTableScript = `
  IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
  BEGIN
    CREATE TABLE Notifications (
      id INT IDENTITY(1,1) PRIMARY KEY,
      userId INT NOT NULL,
      feedbackId INT NULL,
      type NVARCHAR(50) NOT NULL,
      title NVARCHAR(255) NOT NULL,
      message NVARCHAR(MAX) NOT NULL,
      isRead BIT NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      readAt DATETIME NULL,


      -- Foreign key constraints
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (feedbackId) REFERENCES Feedback(id) ON DELETE SET NULL      
    );

    PRINT '✅ Notifications table created successfully';
  END
  ELSE
  BEGIN
    PRINT 'ℹ️  Notifications table already exists';
  END
`;

export const feedbackHistorySchemaUpdates = `
-- Add new columns to support more comprehensive tracking
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = 'actionType')
BEGIN
    ALTER TABLE FeedbackHistory ADD actionType NVARCHAR(50) NULL;
    PRINT '✅ Added actionType column to FeedbackHistory';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = 'oldValue')
BEGIN
    ALTER TABLE FeedbackHistory ADD oldValue NVARCHAR(MAX) NULL;
    PRINT '✅ Added oldValue column to FeedbackHistory';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = 'newValue')
BEGIN
    ALTER TABLE FeedbackHistory ADD newValue NVARCHAR(MAX) NULL;
    PRINT '✅ Added newValue column to FeedbackHistory';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = 'fieldName')
BEGIN
    ALTER TABLE FeedbackHistory ADD fieldName NVARCHAR(100) NULL;
    PRINT '✅ Added fieldName column to FeedbackHistory';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FeedbackHistory' AND COLUMN_NAME = 'isActive')
BEGIN
    ALTER TABLE FeedbackHistory ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT '✅ Added isActive column to FeedbackHistory';
END

-- Update existing records to have default actionType
UPDATE FeedbackHistory 
SET actionType = 'STATUS_CHANGE'
WHERE actionType IS NULL;

-- Add indexes for new columns
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FeedbackHistory_ActionType')
BEGIN
    CREATE INDEX IX_FeedbackHistory_ActionType ON FeedbackHistory(actionType);
    PRINT '✅ Added index for actionType';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FeedbackHistory_FieldName')
BEGIN
    CREATE INDEX IX_FeedbackHistory_FieldName ON FeedbackHistory(fieldName);
    PRINT '✅ Added index for fieldName';
END
`;

export const notificationSchemaUpdates = `
-- Add new columns to support more comprehensive notification features
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'priority')
BEGIN
    ALTER TABLE Notifications ADD priority NVARCHAR(20) NOT NULL DEFAULT 'normal';
    PRINT '✅ Added priority column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'actionUrl')
BEGIN
    ALTER TABLE Notifications ADD actionUrl NVARCHAR(500) NULL;
    PRINT '✅ Added actionUrl column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'actionText')
BEGIN
    ALTER TABLE Notifications ADD actionText NVARCHAR(100) NULL;
    PRINT '✅ Added actionText column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'metadata')
BEGIN
    ALTER TABLE Notifications ADD metadata NVARCHAR(MAX) NULL;
    PRINT '✅ Added metadata column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'triggerUserId')
BEGIN
    ALTER TABLE Notifications ADD triggerUserId INT NULL;
    PRINT '✅ Added triggerUserId column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'isEmailSent')
BEGIN
    ALTER TABLE Notifications ADD isEmailSent BIT NOT NULL DEFAULT 0;
    PRINT '✅ Added isEmailSent column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'emailSentAt')
BEGIN
    ALTER TABLE Notifications ADD emailSentAt DATETIME NULL;
    PRINT '✅ Added emailSentAt column to Notifications';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'isActive')
BEGIN
    ALTER TABLE Notifications ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT '✅ Added isActive column to Notifications';
END

-- Add foreign key for triggerUserId if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Notifications_TriggerUser')
BEGIN
    ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications_TriggerUser 
    FOREIGN KEY (triggerUserId) REFERENCES Users(id) ON DELETE NO ACTION;
    PRINT '✅ Added foreign key for triggerUserId';
END

-- Add indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_Priority')
BEGIN
    CREATE INDEX IX_Notifications_Priority ON Notifications(priority);
    PRINT '✅ Added index for priority';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_Type')
BEGIN
    CREATE INDEX IX_Notifications_Type ON Notifications(type);
    PRINT '✅ Added index for type';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_IsRead')
BEGIN
    CREATE INDEX IX_Notifications_IsRead ON Notifications(isRead);
    PRINT '✅ Added index for isRead';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_TriggerUserId')
BEGIN
    CREATE INDEX IX_Notifications_TriggerUserId ON Notifications(triggerUserId);
    PRINT '✅ Added index for triggerUserId';
END

-- Update existing records to have default priority
UPDATE Notifications 
SET priority = 'normal'
WHERE priority IS NULL;
`;

export const userSchemaUpdates = `
-- Add new columns to support enhanced authentication features
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'isEmailVerified')
BEGIN
    ALTER TABLE Users ADD isEmailVerified BIT NOT NULL DEFAULT 0;
    PRINT '✅ Added isEmailVerified column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'emailVerifiedAt')
BEGIN
    ALTER TABLE Users ADD emailVerifiedAt DATETIME NULL;
    PRINT '✅ Added emailVerifiedAt column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'emailVerificationToken')
BEGIN
    ALTER TABLE Users ADD emailVerificationToken NVARCHAR(255) NULL;
    PRINT '✅ Added emailVerificationToken column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'emailVerificationExpires')
BEGIN
    ALTER TABLE Users ADD emailVerificationExpires DATETIME NULL;
    PRINT '✅ Added emailVerificationExpires column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'twoFactorEnabled')
BEGIN
    ALTER TABLE Users ADD twoFactorEnabled BIT NOT NULL DEFAULT 0;
    PRINT '✅ Added twoFactorEnabled column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'twoFactorSecret')
BEGIN
    ALTER TABLE Users ADD twoFactorSecret NVARCHAR(255) NULL;
    PRINT '✅ Added twoFactorSecret column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'loginAttempts')
BEGIN
    ALTER TABLE Users ADD loginAttempts INT NOT NULL DEFAULT 0;
    PRINT '✅ Added loginAttempts column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'lockUntil')
BEGIN
    ALTER TABLE Users ADD lockUntil DATETIME NULL;
    PRINT '✅ Added lockUntil column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'passwordChangedAt')
BEGIN
    ALTER TABLE Users ADD passwordChangedAt DATETIME NULL;
    PRINT '✅ Added passwordChangedAt column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'passwordResetToken')
BEGIN
    ALTER TABLE Users ADD passwordResetToken NVARCHAR(255) NULL;
    PRINT '✅ Added passwordResetToken column to Users';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'passwordResetExpires')
BEGIN
    ALTER TABLE Users ADD passwordResetExpires DATETIME NULL;
    PRINT '✅ Added passwordResetExpires column to Users';
END

-- Update existing columns to match new model
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'updatedBy' AND DATA_TYPE = 'nvarchar')
BEGIN
    ALTER TABLE Users ALTER COLUMN updatedBy INT NULL;
    PRINT '✅ Updated updatedBy column type to INT';
END

-- Migrate existing data
UPDATE Users SET isEmailVerified = isVerified WHERE isVerified IS NOT NULL;
UPDATE Users SET emailVerificationToken = verificationToken WHERE verificationToken IS NOT NULL;
UPDATE Users SET emailVerificationExpires = verificationTokenExpires WHERE verificationTokenExpires IS NOT NULL;

-- Add new indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_EmailVerificationToken')
BEGIN
    CREATE INDEX IX_Users_EmailVerificationToken ON Users(emailVerificationToken);
    PRINT '✅ Added index for emailVerificationToken';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_PasswordResetToken')
BEGIN
    CREATE INDEX IX_Users_PasswordResetToken ON Users(passwordResetToken);
    PRINT '✅ Added index for passwordResetToken';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_IsEmailVerified')
BEGIN
    CREATE INDEX IX_Users_IsEmailVerified ON Users(isEmailVerified);
    PRINT '✅ Added index for isEmailVerified';
END

-- Drop old columns after migration (optional)
-- IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'isVerified')
-- BEGIN
--     ALTER TABLE Users DROP COLUMN isVerified;
--     PRINT '✅ Dropped old isVerified column';
-- END

-- IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'verificationToken')
-- BEGIN
--     ALTER TABLE Users DROP COLUMN verificationToken;
--     PRINT '✅ Dropped old verificationToken column';
-- END

-- IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'verificationTokenExpires')
-- BEGIN
--     ALTER TABLE Users DROP COLUMN verificationTokenExpires;
--     PRINT '✅ Dropped old verificationTokenExpires column';
-- END
`;

export const feedbackTableSchemaUpdates = `
-- Add isDeleted column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'isDeleted')
BEGIN
    ALTER TABLE Feedback ADD isDeleted BIT NOT NULL DEFAULT 0;
    PRINT '✅ Added isDeleted column to Feedback';
END

-- Add deletedAt column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'deletedAt')
BEGIN
    ALTER TABLE Feedback ADD deletedAt DATETIME NULL;
    PRINT '✅ Added deletedAt column to Feedback';
END

-- Add feedbackStatusId column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'feedbackStatusId')
BEGIN
    ALTER TABLE Feedback ADD feedbackStatusId INT NULL;
    PRINT '✅ Added feedbackStatusId column to Feedback';
END

-- Add feedbackPriorityId column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'feedbackPriorityId')
BEGIN
    ALTER TABLE Feedback ADD feedbackPriorityId INT NULL;
    PRINT '✅ Added feedbackPriorityId column to Feedback';
END

-- Add foreign key constraints
ALTER TABLE Feedback
ADD CONSTRAINT FK_Feedback_FeedbackStatus FOREIGN KEY (feedbackStatusId) REFERENCES FeedbackStatus(id);

ALTER TABLE Feedback
ADD CONSTRAINT FK_Feedback_FeedbackPriority FOREIGN KEY (feedbackPriorityId) REFERENCES FeedbackPriority(id);
`;
