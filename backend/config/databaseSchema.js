// Users table script
export const userTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
  CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Core Identity
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    
    -- Personal Information
    firstName NVARCHAR(50) NOT NULL,
    lastName NVARCHAR(50) NOT NULL,
    profilePicture NVARCHAR(512) NULL,
    bio NVARCHAR(500) NULL,
    dateOfBirth DATE NULL,
    
    -- Contact Information
    phone NVARCHAR(20) NULL,
    address NVARCHAR(255) NULL,
    city NVARCHAR(100) NULL,
    state NVARCHAR(100) NULL,
    country NVARCHAR(100) NULL,
    postalCode NVARCHAR(20) NULL,
    
    -- System Role & Organization
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    organization NVARCHAR(100) NULL,
    
    -- Account Status
    isActive BIT NOT NULL DEFAULT 1,
    isOnline BIT NOT NULL DEFAULT 0,
    lastLogin DATETIME NULL,
    
    -- Email Verification
    isEmailVerified BIT NOT NULL DEFAULT 0,
    emailVerifiedAt DATETIME NULL,
    emailVerificationToken NVARCHAR(255) NULL,
    emailVerificationExpires DATETIME NULL,
    
    -- Security Features
    twoFactorEnabled BIT NOT NULL DEFAULT 0,
    twoFactorSecret NVARCHAR(255) NULL,
    loginAttempts INT NOT NULL DEFAULT 0,
    lockUntil DATETIME NULL,
    
    -- Password Management
    passwordChangedAt DATETIME NULL,
    passwordResetToken NVARCHAR(255) NULL,
    passwordResetExpires DATETIME NULL,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NULL, -- Added this field - self-referencing
    updatedBy INT NULL, -- Self-referencing for who updated the record
    
    -- Soft Delete
    isDeleted BIT NOT NULL DEFAULT 0,
    deletedAt DATETIME NULL,
    deletedBy INT NULL,
    
    -- Constraints
    CONSTRAINT CK_Users_Role CHECK (role IN ('user', 'staff', 'manager', 'admin', 'super_admin')),
    CONSTRAINT CK_Users_LoginAttempts CHECK (loginAttempts >= 0)
  );
  
  -- Add self-referencing foreign keys AFTER table creation
  ALTER TABLE Users ADD CONSTRAINT FK_Users_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id);
  ALTER TABLE Users ADD CONSTRAINT FK_Users_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id);
  ALTER TABLE Users ADD CONSTRAINT FK_Users_DeletedBy FOREIGN KEY (deletedBy) REFERENCES Users(id);
  
  -- Create Indexes for performance
  CREATE INDEX IX_Users_Email ON Users(email);
  CREATE INDEX IX_Users_Username ON Users(username);
  CREATE INDEX IX_Users_Role ON Users(role);
  CREATE INDEX IX_Users_Organization ON Users(organization);
  CREATE INDEX IX_Users_IsActive ON Users(isActive);
  CREATE INDEX IX_Users_IsDeleted ON Users(isDeleted);
  CREATE INDEX IX_Users_EmailVerificationToken ON Users(emailVerificationToken);
  CREATE INDEX IX_Users_PasswordResetToken ON Users(passwordResetToken);
  CREATE INDEX IX_Users_LastLogin ON Users(lastLogin);
  CREATE INDEX IX_Users_CreatedAt ON Users(createdAt);
  
  PRINT '✅ Users table created successfully with enhanced schema';
END
ELSE
BEGIN
  PRINT 'ℹ️  Users table already exists';
END`;

// Case Categories table script
export const caseCategoriesTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseCategories' AND xtype='U')
BEGIN
  CREATE TABLE CaseCategories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Category Information
    name NVARCHAR(100) NOT NULL UNIQUE,
    arabicName NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Visual & Metadata
    color NVARCHAR(20) NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL, -- Icon identifier
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (no cascade delete - preserve data integrity)
    CONSTRAINT FK_CaseCategories_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseCategories_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Indexes
    INDEX IX_CaseCategories_Name (name),
    INDEX IX_CaseCategories_IsActive (isActive),
    INDEX IX_CaseCategories_SortOrder (sortOrder)
  );
  
  PRINT '✅ CaseCategories table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseCategories table already exists';
END`;

// Case Status table script
export const caseStatusTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseStatus' AND xtype='U')
BEGIN
  CREATE TABLE CaseStatus (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Status Information
    name NVARCHAR(100) NOT NULL UNIQUE,
    arabicName NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Visual & Behavior
    color NVARCHAR(20) NOT NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status Behavior
    isInitial BIT NOT NULL DEFAULT 0, -- Can be set as initial status
    isFinal BIT NOT NULL DEFAULT 0,   -- Final status (closed, resolved, etc.)
    allowReopen BIT NOT NULL DEFAULT 1, -- Can be reopened from this status
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys
    CONSTRAINT FK_CaseStatus_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseStatus_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Indexes
    INDEX IX_CaseStatus_Name (name),
    INDEX IX_CaseStatus_IsActive (isActive),
    INDEX IX_CaseStatus_SortOrder (sortOrder),
    INDEX IX_CaseStatus_IsInitial (isInitial),
    INDEX IX_CaseStatus_IsFinal (isFinal)
  );
  
  PRINT '✅ CaseStatus table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseStatus table already exists';
END`;

// Case Priority table script
export const casePriorityTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CasePriority' AND xtype='U')
BEGIN
  CREATE TABLE CasePriority (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Priority Information
    name NVARCHAR(100) NOT NULL UNIQUE,
    arabicName NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Priority Settings
    level INT NOT NULL UNIQUE, -- 1 = Highest, 5 = Lowest
    color NVARCHAR(20) NOT NULL,
    icon NVARCHAR(50) NULL,
    
    -- SLA Settings
    responseTimeHours INT NULL, -- Expected response time in hours
    resolutionTimeHours INT NULL, -- Expected resolution time in hours
    escalationTimeHours INT NULL, -- When to escalate if not resolved
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys
    CONSTRAINT FK_CasePriority_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CasePriority_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_CasePriority_Level CHECK (level BETWEEN 1 AND 10),
    CONSTRAINT CK_CasePriority_ResponseTime CHECK (responseTimeHours > 0),
    CONSTRAINT CK_CasePriority_ResolutionTime CHECK (resolutionTimeHours > 0),
    
    -- Indexes
    INDEX IX_CasePriority_Name (name),
    INDEX IX_CasePriority_Level (level),
    INDEX IX_CasePriority_IsActive (isActive)
  );
  
  PRINT '✅ CasePriority table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  CasePriority table already exists';
END`;

// Regions table script - simplified for documentation purposes
export const regionsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Regions' AND xtype='U')
BEGIN
  CREATE TABLE Regions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Region Information
    name NVARCHAR(100) NOT NULL UNIQUE,
    arabicName NVARCHAR(100) NULL,
    code NVARCHAR(10) NOT NULL UNIQUE, -- Regional code (e.g., 'WB', 'GZ', 'JER')
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Administrative
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (no cascade delete - preserve data integrity)
    CONSTRAINT FK_Regions_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Regions_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Indexes
    INDEX IX_Regions_Name (name),
    INDEX IX_Regions_Code (code),
    INDEX IX_Regions_IsActive (isActive),
    INDEX IX_Regions_SortOrder (sortOrder)
  );
  
  PRINT '✅ Regions table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Regions table already exists';
END`;

// Governorates table script - simplified for documentation purposes
export const governoratesTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Governorates' AND xtype='U')
BEGIN
  CREATE TABLE Governorates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Governorate Information
    name NVARCHAR(100) NOT NULL,
    arabicName NVARCHAR(100) NULL,
    code NVARCHAR(10) NOT NULL, -- Governorate code
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Regional Relationship
    regionId INT NOT NULL,
    
    -- Administrative
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (CASCADE DELETE - if region is deleted, governorates should be deleted)
    CONSTRAINT FK_Governorates_Region FOREIGN KEY (regionId) REFERENCES Regions(id) ON DELETE CASCADE,
    CONSTRAINT FK_Governorates_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Governorates_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Unique constraint on name within region
    CONSTRAINT UQ_Governorates_RegionName UNIQUE (regionId, name),
    CONSTRAINT UQ_Governorates_RegionCode UNIQUE (regionId, code),
    
    -- Indexes
    INDEX IX_Governorates_Name (name),
    INDEX IX_Governorates_Code (code),
    INDEX IX_Governorates_RegionId (regionId),
    INDEX IX_Governorates_IsActive (isActive),
    INDEX IX_Governorates_SortOrder (sortOrder)
  );
  
  PRINT '✅ Governorates table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Governorates table already exists';
END`;

// Communities table script - simplified for documentation purposes
export const communitiesTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Communities' AND xtype='U')
BEGIN
  CREATE TABLE Communities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Community Information
    name NVARCHAR(100) NOT NULL,
    arabicName NVARCHAR(100) NULL,
    code NVARCHAR(10) NULL, -- Community code (optional)
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Hierarchical Relationship
    governorateId INT NOT NULL,
    
    -- Administrative
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (CASCADE DELETE - if governorate is deleted, communities should be deleted)
    CONSTRAINT FK_Communities_Governorate FOREIGN KEY (governorateId) REFERENCES Governorates(id) ON DELETE CASCADE,
    CONSTRAINT FK_Communities_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Communities_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Unique constraint on name within governorate
    CONSTRAINT UQ_Communities_GovernorateName UNIQUE (governorateId, name),
    
    -- Indexes
    INDEX IX_Communities_Name (name),
    INDEX IX_Communities_GovernerateId (governorateId),
    INDEX IX_Communities_IsActive (isActive),
    INDEX IX_Communities_SortOrder (sortOrder)
  );
  
  PRINT '✅ Communities table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Communities table already exists';
END`;

// Case Channels table script - simplified for classification and statistics
export const caseChannelsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseChannels' AND xtype='U')
BEGIN
  CREATE TABLE CaseChannels (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Channel Information
    name NVARCHAR(100) NOT NULL UNIQUE, -- This stores the channel type (e.g., 'Email', 'Phone', 'Website', 'Mobile App')
    arabicName NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Visual & Metadata for UI/Reporting
    color NVARCHAR(20) NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL, -- Icon identifier for UI
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys
    CONSTRAINT FK_CaseChannels_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseChannels_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Indexes
    INDEX IX_CaseChannels_Name (name),
    INDEX IX_CaseChannels_IsActive (isActive),
    INDEX IX_CaseChannels_SortOrder (sortOrder)
  );
  
  PRINT '✅ CaseChannels table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseChannels table already exists';
END`;

// Provider Types table script - simplified for classification
export const providerTypesTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProviderTypes' AND xtype='U')
BEGIN
  CREATE TABLE ProviderTypes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Provider Type Information
    name NVARCHAR(100) NOT NULL UNIQUE,
    arabicName NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    arabicDescription NVARCHAR(500) NULL,
    
    -- Visual & Metadata for UI/Reporting
    color NVARCHAR(20) NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL, -- Icon identifier for UI
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys
    CONSTRAINT FK_ProviderTypes_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_ProviderTypes_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Indexes
    INDEX IX_ProviderTypes_Name (name),
    INDEX IX_ProviderTypes_IsActive (isActive),
    INDEX IX_ProviderTypes_SortOrder (sortOrder)
  );
  
  PRINT '✅ ProviderTypes table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  ProviderTypes table already exists';
END`;

// Programs table script - simplified for documentation and classification
export const programsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Programs' AND xtype='U')
BEGIN
  CREATE TABLE Programs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Program Information
    name NVARCHAR(200) NOT NULL UNIQUE,
    arabicName NVARCHAR(200) NULL,
    code NVARCHAR(20) NOT NULL UNIQUE, -- Program code for identification
    description NVARCHAR(1000) NULL,
    arabicDescription NVARCHAR(1000) NULL,
    
    -- Visual & Metadata for UI/Reporting
    color NVARCHAR(20) NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL, -- Icon identifier for UI
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (no cascade delete - preserve data integrity)
    CONSTRAINT FK_Programs_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Programs_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Indexes
    INDEX IX_Programs_Name (name),
    INDEX IX_Programs_Code (code),
    INDEX IX_Programs_IsActive (isActive),
    INDEX IX_Programs_SortOrder (sortOrder)
  );
  
  PRINT '✅ Programs table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Programs table already exists';
END`;

// Projects table script - simplified for documentation and classification
export const projectsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
BEGIN
  CREATE TABLE Projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Project Information
    name NVARCHAR(200) NOT NULL,
    arabicName NVARCHAR(200) NULL,
    code NVARCHAR(20) NOT NULL, -- Project code for identification
    description NVARCHAR(1000) NULL,
    arabicDescription NVARCHAR(1000) NULL,
    
    -- Program Relationship
    programId INT NULL, -- Can exist without a program
    
    -- Visual & Metadata for UI/Reporting
    color NVARCHAR(20) NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL, -- Icon identifier for UI
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (CASCADE DELETE for program relationship)
    CONSTRAINT FK_Projects_Program FOREIGN KEY (programId) REFERENCES Programs(id) ON DELETE CASCADE,
    CONSTRAINT FK_Projects_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Projects_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Unique constraint on name within program
    CONSTRAINT UQ_Projects_ProgramName UNIQUE (programId, name),
    CONSTRAINT UQ_Projects_ProgramCode UNIQUE (programId, code),
    
    -- Indexes
    INDEX IX_Projects_Name (name),
    INDEX IX_Projects_Code (code),
    INDEX IX_Projects_ProgramId (programId),
    INDEX IX_Projects_IsActive (isActive),
    INDEX IX_Projects_SortOrder (sortOrder)
  );
  
  PRINT '✅ Projects table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Projects table already exists';
END`;

// Activities table script - simplified for documentation and classification
export const activitiesTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Activities' AND xtype='U')
BEGIN
  CREATE TABLE Activities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Activity Information
    name NVARCHAR(200) NOT NULL,
    arabicName NVARCHAR(200) NULL,
    code NVARCHAR(20) NOT NULL, -- Activity code for identification
    description NVARCHAR(1000) NULL,
    arabicDescription NVARCHAR(1000) NULL,
    
    -- Project Relationship
    projectId INT NULL, -- Can exist without a project (standalone activities)
    
    -- Visual & Metadata for UI/Reporting
    color NVARCHAR(20) NULL, -- e.x, Color var(--color-error-100)
    icon NVARCHAR(50) NULL, -- Icon identifier for UI
    sortOrder INT NOT NULL DEFAULT 0,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys (CASCADE DELETE for project relationship)
    CONSTRAINT FK_Activities_Project FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE,
    CONSTRAINT FK_Activities_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_Activities_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Unique constraint on name within project
    CONSTRAINT UQ_Activities_ProjectName UNIQUE (projectId, name),
    CONSTRAINT UQ_Activities_ProjectCode UNIQUE (projectId, code),
    
    -- Indexes
    INDEX IX_Activities_Name (name),
    INDEX IX_Activities_Code (code),
    INDEX IX_Activities_ProjectId (projectId),
    INDEX IX_Activities_IsActive (isActive),
    INDEX IX_Activities_SortOrder (sortOrder)
  );
  
  PRINT '✅ Activities table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Activities table already exists';
END`;

// Cases table script - the main table for beneficiary complaints and feedback
// ...existing code...

// Cases table script - FIXED VERSION with corrected constraints
export const casesTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Cases' AND xtype='U')
BEGIN
  CREATE TABLE Cases (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Case Identification
    caseNumber NVARCHAR(20) NOT NULL UNIQUE, -- Auto-generated unique case number
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    
    -- Case Classification
    categoryId INT NOT NULL,
    priorityId INT NOT NULL,
    statusId INT NOT NULL,
    channelId INT NOT NULL,
    
    -- Case Details
    caseDate DATETIME NOT NULL DEFAULT GETDATE(),
    dueDate DATETIME NULL, -- Calculated based on priority SLA
    resolvedDate DATETIME NULL,
    
    -- Impact & Urgency
    impactDescription NVARCHAR(MAX) NULL,
    urgencyLevel NVARCHAR(20) NULL, -- 'low', 'medium', 'high', 'critical'
    affectedBeneficiaries INT NULL, -- Number of people affected
    
    -- Related Programme/Project/Activity (for context)
    programId INT NULL,
    projectId INT NULL,
    activityId INT NULL,
    isProjectRelated BIT NOT NULL DEFAULT 0,
    
    -- Case Provider (Complainant/Feedback Provider)
    providerTypeId INT NULL,
    
    -- Individual Provider Details
    individualProviderGender NVARCHAR(20) NULL, -- 'male', 'female', 'other', 'prefer_not_to_say'
    individualProviderAgeGroup NVARCHAR(20) NULL, -- '18-25', '26-35', '36-50', '51-65', '65+'
    individualProviderDisabilityStatus NVARCHAR(50) NULL, -- 'none', 'physical', 'visual', 'hearing', 'cognitive', 'multiple'
    
    -- Group Provider Details
    groupProviderSize INT NULL, -- Number of individuals in group
    groupProviderGenderComposition NVARCHAR(100) NULL, -- JSON structure for gender breakdown
    
    -- Contact Information (if consent given)
    providerName NVARCHAR(255) NULL,
    providerEmail NVARCHAR(255) NULL,
    providerPhone NVARCHAR(20) NULL,
    providerOrganization NVARCHAR(200) NULL,
    providerAddress NVARCHAR(500) NULL,
    
    -- Consent & Privacy
    dataSharingConsent BIT NOT NULL DEFAULT 0,
    followUpConsent BIT NOT NULL DEFAULT 0,
    followUpContactMethod NVARCHAR(50) NULL, -- 'email', 'phone', 'in_person', 'none'
    privacyPolicyAccepted BIT NOT NULL DEFAULT 0,
    
    -- Privacy & Security Flags
    isSensitive BIT NOT NULL DEFAULT 0, -- Contains sensitive information
    isAnonymized BIT NOT NULL DEFAULT 0, -- Personal data has been anonymized
    isPublic BIT NOT NULL DEFAULT 0, -- Can be shared publicly
    confidentialityLevel NVARCHAR(20) NOT NULL DEFAULT 'internal', -- 'public', 'internal', 'restricted', 'confidential'
    
    -- Location Information
    communityId INT NULL,
    location NVARCHAR(255) NULL, -- Specific location description
    coordinates NVARCHAR(50) NULL, -- Latitude, Longitude
    
    -- Case Assignment
    assignedTo INT NULL,
    assignedBy INT NULL,
    assignedAt DATETIME NULL,
    assignmentComments NVARCHAR(MAX) NULL,
    
    -- Data Entry Information
    submittedBy INT NULL, -- Staff member who entered the case
    submittedAt DATETIME NOT NULL DEFAULT GETDATE(),
    submittedByInitials NVARCHAR(10) NULL,
    submittedByConfirmation BIT NOT NULL DEFAULT 0,
    submittedByComments NVARCHAR(MAX) NULL,
    
    -- Case Processing
    firstResponseDate DATETIME NULL,
    lastActivityDate DATETIME NULL,
    escalationLevel INT NOT NULL DEFAULT 0, -- 0 = normal, 1+ = escalation levels
    escalatedAt DATETIME NULL,
    escalatedBy INT NULL,
    escalationReason NVARCHAR(500) NULL,
    
    -- Resolution Information
    resolutionSummary NVARCHAR(MAX) NULL,
    resolutionCategory NVARCHAR(100) NULL, -- 'resolved', 'closed_no_action', 'referred', 'duplicate'
    resolutionSatisfaction NVARCHAR(20) NULL, -- 'very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied'
    
    -- Metadata
    tags NVARCHAR(1000) NULL, -- Comma-separated tags for categorization
    attachments NVARCHAR(MAX) NULL, -- JSON array of attachment file paths/URLs
    externalReferences NVARCHAR(500) NULL, -- References to external systems
    
    -- Follow-up & Monitoring
    followUpRequired BIT NOT NULL DEFAULT 0,
    followUpDate DATETIME NULL,
    monitoringRequired BIT NOT NULL DEFAULT 0,
    monitoringDate DATETIME NULL,
    
    -- Quality Assurance
    qualityReviewed BIT NOT NULL DEFAULT 0,
    qualityReviewedBy INT NULL,
    qualityReviewedAt DATETIME NULL,
    qualityScore DECIMAL(3,2) NULL, -- 0.00 to 5.00
    qualityComments NVARCHAR(500) NULL,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Soft Delete
    isDeleted BIT NOT NULL DEFAULT 0,
    deletedAt DATETIME NULL,
    deletedBy INT NULL,
    
    -- Status Tracking
    isActive BIT NOT NULL DEFAULT 1
  );
  
  -- Add Foreign Key Constraints AFTER table creation to avoid circular dependencies
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Category FOREIGN KEY (categoryId) REFERENCES CaseCategories(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Priority FOREIGN KEY (priorityId) REFERENCES CasePriority(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Status FOREIGN KEY (statusId) REFERENCES CaseStatus(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Channel FOREIGN KEY (channelId) REFERENCES CaseChannels(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_ProviderType FOREIGN KEY (providerTypeId) REFERENCES ProviderTypes(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Community FOREIGN KEY (communityId) REFERENCES Communities(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Program FOREIGN KEY (programId) REFERENCES Programs(id) ON DELETE SET NULL;
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Project FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE SET NULL;
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_Activity FOREIGN KEY (activityId) REFERENCES Activities(id) ON DELETE SET NULL;
  
  -- User Foreign Keys (NO CASCADE DELETE - preserve data integrity)
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_AssignedTo FOREIGN KEY (assignedTo) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_AssignedBy FOREIGN KEY (assignedBy) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_SubmittedBy FOREIGN KEY (submittedBy) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_EscalatedBy FOREIGN KEY (escalatedBy) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_QualityReviewedBy FOREIGN KEY (qualityReviewedBy) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id);
  ALTER TABLE Cases ADD CONSTRAINT FK_Cases_DeletedBy FOREIGN KEY (deletedBy) REFERENCES Users(id);
  
  -- Add Check Constraints
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_UrgencyLevel CHECK (urgencyLevel IN ('low', 'medium', 'high', 'critical') OR urgencyLevel IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_IndividualGender CHECK (individualProviderGender IN ('male', 'female', 'other', 'prefer_not_to_say') OR individualProviderGender IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_IndividualAge CHECK (individualProviderAgeGroup IN ('under_18', '18-25', '26-35', '36-50', '51-65', 'over_65') OR individualProviderAgeGroup IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_DisabilityStatus CHECK (individualProviderDisabilityStatus IN ('none', 'physical', 'visual', 'hearing', 'cognitive', 'multiple', 'prefer_not_to_say') OR individualProviderDisabilityStatus IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_FollowUpMethod CHECK (followUpContactMethod IN ('email', 'phone', 'in_person', 'sms', 'none') OR followUpContactMethod IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_ConfidentialityLevel CHECK (confidentialityLevel IN ('public', 'internal', 'restricted', 'confidential'));
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_ResolutionCategory CHECK (resolutionCategory IN ('resolved', 'closed_no_action', 'referred', 'duplicate', 'withdrawn') OR resolutionCategory IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_ResolutionSatisfaction CHECK (resolutionSatisfaction IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied') OR resolutionSatisfaction IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_EscalationLevel CHECK (escalationLevel >= 0);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_AffectedBeneficiaries CHECK (affectedBeneficiaries >= 0 OR affectedBeneficiaries IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_GroupSize CHECK (groupProviderSize >= 0 OR groupProviderSize IS NULL);
  ALTER TABLE Cases ADD CONSTRAINT CK_Cases_QualityScore CHECK (qualityScore BETWEEN 0 AND 5 OR qualityScore IS NULL);
  
  -- Create Indexes for performance
  CREATE INDEX IX_Cases_CaseNumber ON Cases(caseNumber);
  CREATE INDEX IX_Cases_Title ON Cases(title);
  CREATE INDEX IX_Cases_CategoryId ON Cases(categoryId);
  CREATE INDEX IX_Cases_PriorityId ON Cases(priorityId);
  CREATE INDEX IX_Cases_StatusId ON Cases(statusId);
  CREATE INDEX IX_Cases_ChannelId ON Cases(channelId);
  CREATE INDEX IX_Cases_AssignedTo ON Cases(assignedTo);
  CREATE INDEX IX_Cases_AssignedBy ON Cases(assignedBy);
  CREATE INDEX IX_Cases_CaseDate ON Cases(caseDate);
  CREATE INDEX IX_Cases_DueDate ON Cases(dueDate);
  CREATE INDEX IX_Cases_ResolvedDate ON Cases(resolvedDate);
  CREATE INDEX IX_Cases_CommunityId ON Cases(communityId);
  CREATE INDEX IX_Cases_ProgramId ON Cases(programId);
  CREATE INDEX IX_Cases_ProjectId ON Cases(projectId);
  CREATE INDEX IX_Cases_ActivityId ON Cases(activityId);
  CREATE INDEX IX_Cases_ProviderTypeId ON Cases(providerTypeId);
  CREATE INDEX IX_Cases_UrgencyLevel ON Cases(urgencyLevel);
  CREATE INDEX IX_Cases_ConfidentialityLevel ON Cases(confidentialityLevel);
  CREATE INDEX IX_Cases_EscalationLevel ON Cases(escalationLevel);
  CREATE INDEX IX_Cases_IsActive ON Cases(isActive);
  CREATE INDEX IX_Cases_IsDeleted ON Cases(isDeleted);
  CREATE INDEX IX_Cases_CreatedAt ON Cases(createdAt);
  CREATE INDEX IX_Cases_UpdatedAt ON Cases(updatedAt);
  CREATE INDEX IX_Cases_SubmittedAt ON Cases(submittedAt);
  CREATE INDEX IX_Cases_LastActivityDate ON Cases(lastActivityDate);
  
  PRINT '✅ Cases table created successfully with comprehensive schema';
END
ELSE
BEGIN
  PRINT 'ℹ️  Cases table already exists';
END`;

// Case History table script - tracks all changes to cases
export const caseHistoryTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseHistory' AND xtype='U')
BEGIN
  CREATE TABLE CaseHistory (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Case Reference
    caseId INT NOT NULL,
    
    -- Change Tracking
    actionType NVARCHAR(50) NOT NULL, -- 'CREATION', 'STATUS_CHANGE', 'ASSIGNMENT_CHANGE', 'PRIORITY_CHANGE', 'CATEGORY_CHANGE', 'UPDATE', 'COMMENT_ADDED'
    fieldName NVARCHAR(100) NULL, -- Which field was changed
    oldValue NVARCHAR(MAX) NULL, -- Previous value (JSON for complex objects)
    newValue NVARCHAR(MAX) NULL, -- New value (JSON for complex objects)
    
    -- Change Details
    changeDescription NVARCHAR(500) NULL, -- Human-readable description of change
    comments NVARCHAR(MAX) NULL, -- Additional comments about the change
    
    -- Assignment Information (when actionType is ASSIGNMENT_CHANGE)
    assignedTo INT NULL, -- User assigned to
    assignedBy INT NULL, -- User who made the assignment
    assignmentComments NVARCHAR(MAX) NULL, -- Comments about assignment
    
    -- Status Information (when actionType is STATUS_CHANGE)
    statusId INT NULL, -- New status
    statusReason NVARCHAR(500) NULL, -- Reason for status change
    
    -- System Information
    ipAddress NVARCHAR(45) NULL, -- IP address of user making change
    userAgent NVARCHAR(500) NULL, -- Browser/client information
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints (CASCADE DELETE - if case is deleted, history should be deleted)
    CONSTRAINT FK_CaseHistory_Case FOREIGN KEY (caseId) REFERENCES Cases(id) ON DELETE CASCADE,
    CONSTRAINT FK_CaseHistory_AssignedTo FOREIGN KEY (assignedTo) REFERENCES Users(id),
    CONSTRAINT FK_CaseHistory_AssignedBy FOREIGN KEY (assignedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseHistory_Status FOREIGN KEY (statusId) REFERENCES CaseStatus(id),
    CONSTRAINT FK_CaseHistory_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_CaseHistory_ActionType CHECK (actionType IN ('CREATION', 'STATUS_CHANGE', 'ASSIGNMENT_CHANGE', 'PRIORITY_CHANGE', 'CATEGORY_CHANGE', 'UPDATE', 'COMMENT_ADDED', 'ESCALATION', 'RESOLUTION')),
    
    -- Performance Indexes
    INDEX IX_CaseHistory_CaseId (caseId),
    INDEX IX_CaseHistory_ActionType (actionType),
    INDEX IX_CaseHistory_FieldName (fieldName),
    INDEX IX_CaseHistory_AssignedTo (assignedTo),
    INDEX IX_CaseHistory_StatusId (statusId),
    INDEX IX_CaseHistory_CreatedAt (createdAt),
    INDEX IX_CaseHistory_CreatedBy (createdBy),
    INDEX IX_CaseHistory_IsActive (isActive)
  );
  
  PRINT '✅ CaseHistory table created successfully with comprehensive tracking';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseHistory table already exists';
END`;

// Case Comments table script - manages comments and communications
export const caseCommentsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseComments' AND xtype='U')
BEGIN
  CREATE TABLE CaseComments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Case Reference
    caseId INT NOT NULL,
    
    -- Comment Information
    comment NVARCHAR(MAX) NOT NULL,
    commentType NVARCHAR(50) NOT NULL DEFAULT 'internal', -- 'internal', 'external', 'resolution', 'escalation', 'follow_up'
    
    -- Visibility & Privacy
    isInternal BIT NOT NULL DEFAULT 1, -- Internal vs external communication
    isPublic BIT NOT NULL DEFAULT 0, -- Can be shared publicly
    confidentialityLevel NVARCHAR(20) NOT NULL DEFAULT 'internal', -- 'public', 'internal', 'restricted', 'confidential'
    
    -- Communication Details
    recipientType NVARCHAR(50) NULL, -- 'case_provider', 'team_member', 'manager', 'external_partner'
    recipientEmail NVARCHAR(255) NULL, -- If sent via email
    communicationMethod NVARCHAR(50) NULL, -- 'email', 'phone', 'in_person', 'system'
    communicationStatus NVARCHAR(50) NULL, -- 'sent', 'delivered', 'read', 'failed'
    
    -- Attachment Support
    attachments NVARCHAR(MAX) NULL, -- JSON array of attachment file paths/URLs
    attachmentCount INT NOT NULL DEFAULT 0,
    
    -- Response Information
    parentCommentId INT NULL, -- For threaded conversations
    isResponse BIT NOT NULL DEFAULT 0,
    responseToUserId INT NULL, -- Which user this is responding to
    
    -- Tagging & Mentions
    mentionedUsers NVARCHAR(500) NULL, -- JSON array of mentioned user IDs
    tags NVARCHAR(500) NULL, -- Comma-separated tags
    
    -- Follow-up Information
    requiresFollowUp BIT NOT NULL DEFAULT 0,
    followUpDate DATETIME NULL,
    followUpCompleted BIT NOT NULL DEFAULT 0,
    followUpCompletedAt DATETIME NULL,
    
    -- Editorial Information
    isEdited BIT NOT NULL DEFAULT 0,
    editedAt DATETIME NULL,
    editedBy INT NULL,
    editReason NVARCHAR(255) NULL,
    originalComment NVARCHAR(MAX) NULL, -- Backup of original comment
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL,
    updatedBy INT NOT NULL,
    
    -- Soft Delete
    isDeleted BIT NOT NULL DEFAULT 0,
    deletedAt DATETIME NULL,
    deletedBy INT NULL,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints (CASCADE DELETE - if case is deleted, comments should be deleted)
    CONSTRAINT FK_CaseComments_Case FOREIGN KEY (caseId) REFERENCES Cases(id) ON DELETE CASCADE,
    CONSTRAINT FK_CaseComments_ParentComment FOREIGN KEY (parentCommentId) REFERENCES CaseComments(id),
    CONSTRAINT FK_CaseComments_ResponseToUser FOREIGN KEY (responseToUserId) REFERENCES Users(id),
    CONSTRAINT FK_CaseComments_EditedBy FOREIGN KEY (editedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseComments_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseComments_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseComments_DeletedBy FOREIGN KEY (deletedBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_CaseComments_CommentType CHECK (commentType IN ('internal', 'external', 'resolution', 'escalation', 'follow_up', 'status_update', 'assignment')),
    CONSTRAINT CK_CaseComments_RecipientType CHECK (recipientType IN ('case_provider', 'team_member', 'manager', 'external_partner', 'system', NULL)),
    CONSTRAINT CK_CaseComments_CommunicationMethod CHECK (communicationMethod IN ('email', 'phone', 'in_person', 'system', 'sms', 'video_call', NULL)),
    CONSTRAINT CK_CaseComments_CommunicationStatus CHECK (communicationStatus IN ('sent', 'delivered', 'read', 'failed', 'pending', NULL)),
    CONSTRAINT CK_CaseComments_ConfidentialityLevel CHECK (confidentialityLevel IN ('public', 'internal', 'restricted', 'confidential')),
    CONSTRAINT CK_CaseComments_AttachmentCount CHECK (attachmentCount >= 0),
    
    -- Performance Indexes
    INDEX IX_CaseComments_CaseId (caseId),
    INDEX IX_CaseComments_CommentType (commentType),
    INDEX IX_CaseComments_IsInternal (isInternal),
    INDEX IX_CaseComments_IsPublic (isPublic),
    INDEX IX_CaseComments_ConfidentialityLevel (confidentialityLevel),
    INDEX IX_CaseComments_ParentCommentId (parentCommentId),
    INDEX IX_CaseComments_ResponseToUserId (responseToUserId),
    INDEX IX_CaseComments_RequiresFollowUp (requiresFollowUp),
    INDEX IX_CaseComments_FollowUpDate (followUpDate),
    INDEX IX_CaseComments_CreatedAt (createdAt),
    INDEX IX_CaseComments_CreatedBy (createdBy),
    INDEX IX_CaseComments_IsActive (isActive),
    INDEX IX_CaseComments_IsDeleted (isDeleted)
  );
  
  PRINT '✅ CaseComments table created successfully with comprehensive communication tracking';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseComments table already exists';
END`;

// Case Assignments table script - tracks assignment history and workflow
export const caseAssignmentsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseAssignments' AND xtype='U')
BEGIN
  CREATE TABLE CaseAssignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Case and Assignment Information
    caseId INT NOT NULL,
    assignedTo INT NOT NULL,
    assignedBy INT NOT NULL,
    
    -- Assignment Details
    assignmentType NVARCHAR(50) NOT NULL DEFAULT 'primary', -- 'primary', 'secondary', 'reviewer', 'escalated', 'temporary'
    assignmentReason NVARCHAR(500) NULL, -- Reason for assignment
    comments NVARCHAR(MAX) NULL, -- Comments about the assignment
    
    -- Assignment Timeline
    assignedAt DATETIME NOT NULL DEFAULT GETDATE(),
    expectedCompletionDate DATETIME NULL,
    actualCompletionDate DATETIME NULL,
    
    -- Assignment Status
    assignmentStatus NVARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'transferred', 'escalated', 'cancelled'
    completionComments NVARCHAR(MAX) NULL,
    
    -- Workload & Capacity
    workloadPercentage DECIMAL(5,2) NULL, -- Percentage of assignee's capacity (0.00 to 100.00)
    estimatedHours DECIMAL(8,2) NULL, -- Estimated hours to complete
    actualHours DECIMAL(8,2) NULL, -- Actual hours spent
    
    -- Transfer Information
    transferredTo INT NULL, -- If assignment was transferred
    transferredBy INT NULL, -- Who initiated the transfer
    transferredAt DATETIME NULL,
    transferReason NVARCHAR(500) NULL,
    
    -- Escalation Information
    escalatedTo INT NULL, -- If assignment was escalated
    escalatedBy INT NULL, -- Who initiated the escalation
    escalatedAt DATETIME NULL,
    escalationLevel INT NOT NULL DEFAULT 0, -- Level of escalation
    escalationReason NVARCHAR(500) NULL,
    
    -- Performance Tracking
    responseTime DECIMAL(10,2) NULL, -- Hours to first response
    resolutionTime DECIMAL(10,2) NULL, -- Hours to resolution
    qualityScore DECIMAL(3,2) NULL, -- Quality assessment (0.00 to 5.00)
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL,
    updatedBy INT NOT NULL,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints (CASCADE DELETE - if case is deleted, assignments should be deleted)
    CONSTRAINT FK_CaseAssignments_Case FOREIGN KEY (caseId) REFERENCES Cases(id) ON DELETE CASCADE,
    CONSTRAINT FK_CaseAssignments_AssignedTo FOREIGN KEY (assignedTo) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_AssignedBy FOREIGN KEY (assignedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_TransferredTo FOREIGN KEY (transferredTo) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_TransferredBy FOREIGN KEY (transferredBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_EscalatedTo FOREIGN KEY (escalatedTo) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_EscalatedBy FOREIGN KEY (escalatedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAssignments_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_CaseAssignments_AssignmentType CHECK (assignmentType IN ('primary', 'secondary', 'reviewer', 'escalated', 'temporary', 'collaborative')),
    CONSTRAINT CK_CaseAssignments_AssignmentStatus CHECK (assignmentStatus IN ('active', 'completed', 'transferred', 'escalated', 'cancelled', 'on_hold')),
    CONSTRAINT CK_CaseAssignments_WorkloadPercentage CHECK (workloadPercentage BETWEEN 0 AND 100),
    CONSTRAINT CK_CaseAssignments_EstimatedHours CHECK (estimatedHours >= 0),
    CONSTRAINT CK_CaseAssignments_ActualHours CHECK (actualHours >= 0),
    CONSTRAINT CK_CaseAssignments_EscalationLevel CHECK (escalationLevel >= 0),
    CONSTRAINT CK_CaseAssignments_ResponseTime CHECK (responseTime >= 0),
    CONSTRAINT CK_CaseAssignments_ResolutionTime CHECK (resolutionTime >= 0),
    CONSTRAINT CK_CaseAssignments_QualityScore CHECK (qualityScore BETWEEN 0 AND 5),
    
    -- Performance Indexes
    INDEX IX_CaseAssignments_CaseId (caseId),
    INDEX IX_CaseAssignments_AssignedTo (assignedTo),
    INDEX IX_CaseAssignments_AssignedBy (assignedBy),
    INDEX IX_CaseAssignments_AssignmentType (assignmentType),
    INDEX IX_CaseAssignments_AssignmentStatus (assignmentStatus),
    INDEX IX_CaseAssignments_AssignedAt (assignedAt),
    INDEX IX_CaseAssignments_ExpectedCompletionDate (expectedCompletionDate),
    INDEX IX_CaseAssignments_TransferredTo (transferredTo),
    INDEX IX_CaseAssignments_EscalatedTo (escalatedTo),
    INDEX IX_CaseAssignments_EscalationLevel (escalationLevel),
    INDEX IX_CaseAssignments_IsActive (isActive),
    INDEX IX_CaseAssignments_CreatedAt (createdAt)
  );
  
  PRINT '✅ CaseAssignments table created successfully with comprehensive assignment tracking';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseAssignments table already exists';
END`;

// Case Attachments table script - manages file attachments
export const caseAttachmentsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CaseAttachments' AND xtype='U')
BEGIN
  CREATE TABLE CaseAttachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Case Reference
    caseId INT NOT NULL,
    
    -- File Information
    fileName NVARCHAR(255) NOT NULL,
    originalFileName NVARCHAR(255) NOT NULL,
    filePath NVARCHAR(1000) NOT NULL,
    fileSize BIGINT NOT NULL, -- Size in bytes
    fileType NVARCHAR(100) NOT NULL, -- MIME type
    fileExtension NVARCHAR(10) NOT NULL,
    
    -- File Categorization
    attachmentType NVARCHAR(50) NOT NULL DEFAULT 'document', -- 'document', 'image', 'audio', 'video', 'other'
    attachmentCategory NVARCHAR(50) NULL, -- 'evidence', 'correspondence', 'resolution', 'support'
    description NVARCHAR(500) NULL,
    
    -- Security & Privacy
    confidentialityLevel NVARCHAR(20) NOT NULL DEFAULT 'internal', -- 'public', 'internal', 'restricted', 'confidential'
    encryptionStatus NVARCHAR(20) NOT NULL DEFAULT 'none', -- 'none', 'encrypted', 'password_protected'
    accessControl NVARCHAR(MAX) NULL, -- JSON array of user IDs with access
    
    -- Storage Information
    storageProvider NVARCHAR(50) NOT NULL DEFAULT 'local', -- 'local', 'azure', 'aws', 'google'
    storageLocation NVARCHAR(500) NULL, -- Cloud storage path/container
    checksum NVARCHAR(128) NULL, -- File integrity verification
    
    -- Download & Access Tracking
    downloadCount INT NOT NULL DEFAULT 0,
    lastDownloadedAt DATETIME NULL,
    lastDownloadedBy INT NULL,
    
    -- Virus Scanning
    virusScanStatus NVARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'clean', 'infected', 'quarantined', 'failed'
    virusScanDate DATETIME NULL,
    virusScanResult NVARCHAR(500) NULL,
    
    -- Thumbnail & Preview
    thumbnailPath NVARCHAR(1000) NULL, -- Path to thumbnail for images/videos
    previewPath NVARCHAR(1000) NULL, -- Path to preview/compressed version
    hasPreview BIT NOT NULL DEFAULT 0,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL,
    updatedBy INT NOT NULL,
    
    -- Soft Delete
    isDeleted BIT NOT NULL DEFAULT 0,
    deletedAt DATETIME NULL,
    deletedBy INT NULL,
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints (CASCADE DELETE - if case is deleted, attachments should be deleted)
    CONSTRAINT FK_CaseAttachments_Case FOREIGN KEY (caseId) REFERENCES Cases(id) ON DELETE CASCADE,
    CONSTRAINT FK_CaseAttachments_LastDownloadedBy FOREIGN KEY (lastDownloadedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAttachments_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAttachments_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    CONSTRAINT FK_CaseAttachments_DeletedBy FOREIGN KEY (deletedBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_CaseAttachments_AttachmentType CHECK (attachmentType IN ('document', 'image', 'audio', 'video', 'other')),
    CONSTRAINT CK_CaseAttachments_AttachmentCategory CHECK (attachmentCategory IN ('evidence', 'correspondence', 'resolution', 'support', 'identity', NULL)),
    CONSTRAINT CK_CaseAttachments_ConfidentialityLevel CHECK (confidentialityLevel IN ('public', 'internal', 'restricted', 'confidential')),
    CONSTRAINT CK_CaseAttachments_EncryptionStatus CHECK (encryptionStatus IN ('none', 'encrypted', 'password_protected')),
    CONSTRAINT CK_CaseAttachments_StorageProvider CHECK (storageProvider IN ('local', 'azure', 'aws', 'google', 'onedrive')),
    CONSTRAINT CK_CaseAttachments_VirusScanStatus CHECK (virusScanStatus IN ('pending', 'clean', 'infected', 'quarantined', 'failed', 'skipped')),
    CONSTRAINT CK_CaseAttachments_FileSize CHECK (fileSize >= 0),
    CONSTRAINT CK_CaseAttachments_DownloadCount CHECK (downloadCount >= 0),
    
    -- Performance Indexes
    INDEX IX_CaseAttachments_CaseId (caseId),
    INDEX IX_CaseAttachments_FileName (fileName),
    INDEX IX_CaseAttachments_FileType (fileType),
    INDEX IX_CaseAttachments_AttachmentType (attachmentType),
    INDEX IX_CaseAttachments_AttachmentCategory (attachmentCategory),
    INDEX IX_CaseAttachments_ConfidentialityLevel (confidentialityLevel),
    INDEX IX_CaseAttachments_VirusScanStatus (virusScanStatus),
    INDEX IX_CaseAttachments_CreatedAt (createdAt),
    INDEX IX_CaseAttachments_CreatedBy (createdBy),
    INDEX IX_CaseAttachments_IsActive (isActive),
    INDEX IX_CaseAttachments_IsDeleted (isDeleted)
  );
  
  PRINT '✅ CaseAttachments table created successfully with comprehensive file management';
END
ELSE
BEGIN
  PRINT 'ℹ️  CaseAttachments table already exists';
END`;

// Notifications table script - enhanced for comprehensive notification system
export const notificationsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
BEGIN
  CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Notification Target
    userId INT NOT NULL,
    
    -- Related Entity
    caseId INT NULL, -- Related case (if applicable)
    entityType NVARCHAR(50) NULL, -- 'case', 'user', 'assignment', 'comment'
    entityId INT NULL, -- ID of the related entity
    
    -- Notification Content
    type NVARCHAR(50) NOT NULL, -- 'case_assigned', 'case_updated', 'comment_added', 'escalation', 'due_date_reminder'
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    priority NVARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Notification Actions
    actionUrl NVARCHAR(500) NULL, -- URL to navigate to when clicked
    actionText NVARCHAR(100) NULL, -- Text for action button
    
    -- Notification Status
    isRead BIT NOT NULL DEFAULT 0,
    readAt DATETIME NULL,
    
    -- Email Notification
    isEmailSent BIT NOT NULL DEFAULT 0,
    emailSentAt DATETIME NULL,
    emailError NVARCHAR(500) NULL, -- Error message if email failed
    
    -- Push Notification
    isPushSent BIT NOT NULL DEFAULT 0,
    pushSentAt DATETIME NULL,
    pushError NVARCHAR(500) NULL, -- Error message if push failed
    
    -- Notification Metadata
    metadata NVARCHAR(MAX) NULL, -- JSON data for additional context
    
    -- Trigger Information
    triggerUserId INT NULL, -- User who triggered the notification
    triggerAction NVARCHAR(100) NULL, -- Action that triggered the notification
    
    -- Expiration
    expiresAt DATETIME NULL, -- When notification should expire
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints
    CONSTRAINT FK_Notifications_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Notifications_Case FOREIGN KEY (caseId) REFERENCES Cases(id) ON DELETE CASCADE,
    CONSTRAINT FK_Notifications_TriggerUser FOREIGN KEY (triggerUserId) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_Notifications_Type CHECK (type IN ('case_assigned', 'case_updated', 'case_status_changed', 'comment_added', 'escalation', 'due_date_reminder', 'case_resolved', 'assignment_transferred', 'quality_review_required')),
    CONSTRAINT CK_Notifications_Priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT CK_Notifications_EntityType CHECK (entityType IN ('case', 'user', 'assignment', 'comment', 'attachment', NULL)),
    
    -- Performance Indexes
    INDEX IX_Notifications_UserId (userId),
    INDEX IX_Notifications_CaseId (caseId),
    INDEX IX_Notifications_Type (type),
    INDEX IX_Notifications_Priority (priority),
    INDEX IX_Notifications_IsRead (isRead),
    INDEX IX_Notifications_CreatedAt (createdAt),
    INDEX IX_Notifications_TriggerUserId (triggerUserId),
    INDEX IX_Notifications_ExpiresAt (expiresAt),
    INDEX IX_Notifications_IsActive (isActive)
  );
  
  PRINT '✅ Notifications table created successfully with comprehensive notification features';
END
ELSE
BEGIN
  PRINT 'ℹ️  Notifications table already exists';
END`;

// System Settings table script - for application configuration
export const systemSettingsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SystemSettings' AND xtype='U')
BEGIN
  CREATE TABLE SystemSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Setting Information
    settingKey NVARCHAR(100) NOT NULL UNIQUE,
    settingValue NVARCHAR(MAX) NULL,
    settingType NVARCHAR(50) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'encrypted'
    
    -- Setting Metadata
    category NVARCHAR(50) NOT NULL, -- 'email', 'notification', 'sla', 'security', 'ui', 'integration'
    displayName NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000) NULL,
    
    -- Validation
    validationRules NVARCHAR(MAX) NULL, -- JSON validation rules
    defaultValue NVARCHAR(MAX) NULL,
    
    -- Access Control
    isPublic BIT NOT NULL DEFAULT 0, -- Can be accessed by non-admin users
    isEncrypted BIT NOT NULL DEFAULT 0, -- Value is encrypted
    requiresRestart BIT NOT NULL DEFAULT 0, -- Application restart required after change
    
    -- Environment Specific
    environment NVARCHAR(20) NOT NULL DEFAULT 'all', -- 'development', 'staging', 'production', 'all'
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL DEFAULT 1,
    
    -- Foreign Keys
    CONSTRAINT FK_SystemSettings_CreatedBy FOREIGN KEY (createdBy) REFERENCES Users(id),
    CONSTRAINT FK_SystemSettings_UpdatedBy FOREIGN KEY (updatedBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_SystemSettings_SettingType CHECK (settingType IN ('string', 'number', 'boolean', 'json', 'encrypted')),
    CONSTRAINT CK_SystemSettings_Category CHECK (category IN ('email', 'notification', 'sla', 'security', 'ui', 'integration', 'general')),
    CONSTRAINT CK_SystemSettings_Environment CHECK (environment IN ('development', 'staging', 'production', 'all')),
    
    -- Performance Indexes
    INDEX IX_SystemSettings_SettingKey (settingKey),
    INDEX IX_SystemSettings_Category (category),
    INDEX IX_SystemSettings_Environment (environment),
    INDEX IX_SystemSettings_IsActive (isActive),
    INDEX IX_SystemSettings_IsPublic (isPublic)
  );
  
  PRINT '✅ SystemSettings table created successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  SystemSettings table already exists';
END`;

// User Sessions table script - for session management
export const userSessionsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserSessions' AND xtype='U')
BEGIN
  CREATE TABLE UserSessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Session Information
    sessionToken NVARCHAR(1000) NOT NULL UNIQUE,
    userId INT NOT NULL,
    
    -- Token Information
    refreshToken NVARCHAR(1000) NULL,
    refreshTokenExpiresAt DATETIME NULL,
    
    -- Session Details
    ipAddress NVARCHAR(45) NULL,
    userAgent NVARCHAR(1000) NULL,
    deviceInfo NVARCHAR(500) NULL, -- JSON device information
    location NVARCHAR(200) NULL, -- Geographic location if available
    
    -- Session Lifecycle
    expiresAt DATETIME NOT NULL,
    lastActivityAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    -- Security
    isRevoked BIT NOT NULL DEFAULT 0,
    revokedAt DATETIME NULL,
    revokedBy INT NULL, -- User who revoked the session
    revokeReason NVARCHAR(255) NULL,
    
    -- Session Type
    sessionType NVARCHAR(50) NOT NULL DEFAULT 'web', -- 'web', 'mobile', 'api', 'admin'
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints
    CONSTRAINT FK_UserSessions_User FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_UserSessions_RevokedBy FOREIGN KEY (revokedBy) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_UserSessions_SessionType CHECK (sessionType IN ('web', 'mobile', 'api', 'admin')),
    
    -- Performance Indexes
    INDEX IX_UserSessions_SessionToken (sessionToken),
    INDEX IX_UserSessions_UserId (userId),
    INDEX IX_UserSessions_RefreshToken (refreshToken),
    INDEX IX_UserSessions_ExpiresAt (expiresAt),
    INDEX IX_UserSessions_LastActivityAt (lastActivityAt),
    INDEX IX_UserSessions_IsRevoked (isRevoked),
    INDEX IX_UserSessions_SessionType (sessionType),
    INDEX IX_UserSessions_CreatedAt (createdAt)
  );
  
  PRINT '✅ UserSessions table created successfully with comprehensive session management';
END
ELSE
BEGIN
  PRINT 'ℹ️  UserSessions table already exists';
END`;

// Audit Logs table script - comprehensive audit trail
export const auditLogsTableScript = `
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
BEGIN
  CREATE TABLE AuditLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- User Information
    userId INT NULL, -- NULL for system actions
    
    -- Action Information
    action NVARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ASSIGN', etc.
    entityType NVARCHAR(50) NOT NULL, -- 'case', 'user', 'comment', 'attachment', etc.
    entityId INT NULL, -- ID of the affected entity
    
    -- Change Details
    oldValues NVARCHAR(MAX) NULL, -- JSON of old values
    newValues NVARCHAR(MAX) NULL, -- JSON of new values
    fieldChanges NVARCHAR(MAX) NULL, -- JSON of specific field changes
    
    -- Request Information
    ipAddress NVARCHAR(45) NULL,
    userAgent NVARCHAR(1000) NULL,
    requestMethod NVARCHAR(10) NULL, -- GET, POST, PUT, DELETE
    requestUrl NVARCHAR(1000) NULL,
    requestHeaders NVARCHAR(MAX) NULL, -- JSON of relevant headers
    
    -- Result Information
    success BIT NOT NULL DEFAULT 1,
    errorMessage NVARCHAR(MAX) NULL,
    responseCode INT NULL, -- HTTP response code
    
    -- Performance Metrics
    executionTimeMs INT NULL, -- Execution time in milliseconds
    
    -- Security & Context
    sessionId NVARCHAR(1000) NULL,
    correlationId NVARCHAR(100) NULL, -- For tracking related actions
    riskScore DECIMAL(3,2) NULL, -- 0.00 to 5.00 for security analysis
    
    -- Metadata
    metadata NVARCHAR(MAX) NULL, -- JSON for additional context
    
    -- Audit Fields
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    
    -- Status
    isActive BIT NOT NULL DEFAULT 1,
    
    -- Foreign Key Constraints
    CONSTRAINT FK_AuditLogs_User FOREIGN KEY (userId) REFERENCES Users(id),
    
    -- Constraints
    CONSTRAINT CK_AuditLogs_Action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ASSIGN', 'TRANSFER', 'ESCALATE', 'RESOLVE', 'COMMENT', 'ATTACH', 'VIEW', 'EXPORT', 'SYSTEM_INIT')),
    CONSTRAINT CK_AuditLogs_EntityType CHECK (entityType IN ('case', 'user', 'comment', 'attachment', 'assignment', 'notification', 'setting', 'session', 'system')),
    CONSTRAINT CK_AuditLogs_RequestMethod CHECK (requestMethod IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', NULL)),
    CONSTRAINT CK_AuditLogs_RiskScore CHECK (riskScore BETWEEN 0 AND 5),
    
    -- Performance Indexes
    INDEX IX_AuditLogs_UserId (userId),
    INDEX IX_AuditLogs_Action (action),
    INDEX IX_AuditLogs_EntityType (entityType),
    INDEX IX_AuditLogs_EntityId (entityId),
    INDEX IX_AuditLogs_CreatedAt (createdAt),
    INDEX IX_AuditLogs_IpAddress (ipAddress),
    INDEX IX_AuditLogs_Success (success),
    INDEX IX_AuditLogs_CorrelationId (correlationId),
    INDEX IX_AuditLogs_IsActive (isActive)
  );
  
  PRINT '✅ AuditLogs table created successfully with comprehensive audit capabilities';
END
ELSE
BEGIN
  PRINT 'ℹ️  AuditLogs table already exists';
END`;

// Admin User Creation
export const insertAdminUserScript = `
INSERT INTO Users (
  username, email, password, firstName, lastName, role, organization, 
  isActive, isEmailVerified, emailVerifiedAt, createdBy, updatedBy
)
VALUES (
  @username, @email, @password, @firstName, @lastName, @role, @organization, 
  @isActive, @isEmailVerified, @emailVerifiedAt, NULL, NULL
)`;

export const logCreatedAdminUserScript = `
IF NOT EXISTS (SELECT * FROM AuditLogs WHERE action = 'SYSTEM_INIT' AND entityType = 'user')
BEGIN
  INSERT INTO AuditLogs (userId, action, entityType, entityId, newValues, metadata, createdAt)
  VALUES (@userId, 'SYSTEM_INIT', 'user', @userId, '{"username": "admin", "role": "super_admin"}', '{"type": "initial_setup"}', GETDATE())
END`;

// Case Categories
export const insertInitialCategoriesScript = `
IF NOT EXISTS (SELECT * FROM CaseCategories WHERE name = 'Service Quality')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO CaseCategories (name, arabicName, description, arabicDescription, color, icon, sortOrder, createdBy, updatedBy)
  VALUES
    ('Service Quality', 'جودة الخدمة', 'Issues related to the quality of services provided', 'قضايا متعلقة بجودة الخدمات المقدمة', '--color-blue-200', 'star', 1, @adminUserId, @adminUserId),
    ('Access & Availability', 'الوصول والتوفر', 'Issues related to accessing services or their availability', 'قضايا متعلقة بالوصول للخدمات أو توفرها', '--color-red-200', 'clock', 2, @adminUserId, @adminUserId),
    ('Staff Conduct', 'سلوك الموظفين', 'Issues related to staff behavior and professionalism', 'قضايا متعلقة بسلوك الموظفين والمهنية', '--color-orange-200', 'users', 3, @adminUserId, @adminUserId),
    ('Safety & Security', 'السلامة والأمن', 'Issues related to safety and security concerns', 'قضايا متعلقة بمخاوف السلامة والأمن', '--color-red-200', 'shield', 4, @adminUserId, @adminUserId),
    ('Discrimination', 'التمييز', 'Issues related to discrimination or unfair treatment', 'قضايا متعلقة بالتمييز أو المعاملة غير العادلة', '--color-brown-200', 'alert-triangle', 5, @adminUserId, @adminUserId),
    ('Positive Feedback', 'تعليقات إيجابية', 'Positive feedback and compliments', 'تعليقات إيجابية ومجاملات', '--color-green-200', 'heart', 6, @adminUserId, @adminUserId),
    ('Suggestion', 'اقتراح', 'Suggestions for improvement', 'اقتراحات للتحسين', '--color-blue-200', 'lightbulb', 7, @adminUserId, @adminUserId),
    ('Other', 'أخرى', 'Other issues not covered by above categories', 'قضايا أخرى غير مغطاة بالفئات أعلاه', '--color-gray-200', 'more-horizontal', 8, @adminUserId, @adminUserId);

  PRINT '✅ Initial case categories inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Case categories already exist';
END`;

// Case Status
export const insertInitialStatusScript = `
IF NOT EXISTS (SELECT * FROM CaseStatus WHERE name = 'New')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO CaseStatus (name, arabicName, description, arabicDescription, color, icon, sortOrder, isInitial, isFinal, allowReopen, createdBy, updatedBy)
  VALUES
    ('New', 'جديد', 'Newly submitted case', '', '--color-blue-200', 'plus-circle', 1, 1, 0, 1, @adminUserId, @adminUserId),
    ('In Review', 'قيد المراجعة', 'Case is being reviewed', 'الحالة قيد المراجعة', '--color-yellow-200', 'eye', 2, 0, 0, 1, @adminUserId, @adminUserId),
    ('Assigned', 'مُوكلة', 'Case has been assigned to a team member', 'تم تكليف الحالة لعضو في الفريق', '--color-purple-200', 'user-check', 3, 0, 0, 1, @adminUserId, @adminUserId),
    ('In Progress', 'قيد المعالجة', 'Case is actively being worked on', 'الحالة قيد المعالجة بشكل فعال', '--color-teal-200', 'activity', 4, 0, 0, 1, @adminUserId, @adminUserId),
    ('Pending Info', 'في انتظار معلومات', 'Waiting for additional information', 'في انتظار معلومات إضافية', '--color-orange-200', 'help-circle', 5, 0, 0, 1, @adminUserId, @adminUserId),
    ('Escalated', 'مُصعدة', 'Case has been escalated', 'تم تصعيد الحالة', '--color-red-200', 'arrow-up', 6, 0, 0, 1, @adminUserId, @adminUserId),
    ('Resolved', 'محلولة', 'Case has been resolved', 'تم حل الحالة', '--color-green-200', 'check-circle', 7, 0, 1, 1, @adminUserId, @adminUserId),
    ('Closed', 'مغلقة', 'Case has been closed', 'تم إغلاق الحالة', '--color-gray-200', 'x-circle', 8, 0, 1, 0, @adminUserId, @adminUserId),
    ('Reopened', 'مُعاد فتحها', 'Case has been reopened', 'تم إعادة فتح الحالة', '--color-purple-200', 'refresh-cw', 9, 0, 0, 1, @adminUserId, @adminUserId);

  PRINT '✅ Initial case status inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Case status already exist';
END`;

// Case Priority
export const insertInitialPriorityScript = `
IF NOT EXISTS (SELECT * FROM CasePriority WHERE name = 'Low')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO CasePriority (name, arabicName, description, arabicDescription, level, color, icon, responseTimeHours, resolutionTimeHours, escalationTimeHours, createdBy, updatedBy)
  VALUES
    ('Low', 'منخفضة', 'Low priority case', 'حالة ذات أولوية منخفضة', 5, '--color-green-200', 'minus', 72, 720, 480, @adminUserId, @adminUserId),
    ('Medium', 'متوسطة', 'Medium priority case', 'حالة ذات أولوية متوسطة', 3, '--color-orange-200', 'equal', 24, 168, 120, @adminUserId, @adminUserId),
    ('High', 'عالية', 'High priority case', 'حالة ذات أولوية عالية', 2, '--color-red-200', 'plus', 4, 48, 24, @adminUserId, @adminUserId),
    ('Critical', 'حرجة', 'Critical priority case requiring immediate attention', 'حالة ذات أولوية حرجة تتطلب اهتماماً فورياً', 1, '--color-brown-200', 'alert-triangle', 1, 24, 8, @adminUserId, @adminUserId);

  PRINT '✅ Initial case priorities inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Case priorities already exist';
END`;

// Regions
export const insertInitialRegionsScript = `
IF NOT EXISTS (SELECT * FROM Regions WHERE name = 'West Bank')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO Regions (name, arabicName, code, description, arabicDescription, sortOrder, createdBy, updatedBy)
  VALUES
    ('West Bank', 'الضفة الغربية', 'WB', 'West Bank region', 'منطقة الضفة الغربية', 1, @adminUserId, @adminUserId),
    ('Gaza Strip', 'قطاع غزة', 'GZ', 'Gaza Strip region', 'منطقة قطاع غزة', 2, @adminUserId, @adminUserId),
    ('Jerusalem', 'القدس', 'JER', 'Jerusalem region', 'منطقة القدس', 3, @adminUserId, @adminUserId);
  
  PRINT '✅ Initial regions inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Regions already exist';
END`;

// Case Channels
export const insertInitialChannelsScript = `
IF NOT EXISTS (SELECT * FROM CaseChannels WHERE name = 'Website')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO CaseChannels (name, arabicName, description, arabicDescription, color, icon, sortOrder, createdBy, updatedBy)
  VALUES
    ('Website', 'الموقع الإلكتروني', 'Cases submitted through the website form', 'الحالات المقدمة عبر نموذج الموقع الإلكتروني', '--color-blue-200', 'globe', 1, @adminUserId, @adminUserId),
    ('Mobile App', 'التطبيق المحمول', 'Cases submitted through the mobile application', 'الحالات المقدمة عبر التطبيق المحمول', '--color-cyan-200', 'smartphone', 2, @adminUserId, @adminUserId),
    ('Email', 'البريد الإلكتروني', 'Cases received via email', 'الحالات المستلمة عبر البريد الإلكتروني', '--color-orange-200', 'mail', 3, @adminUserId, @adminUserId),
    ('Phone', 'الهاتف', 'Cases reported via phone call', 'الحالات المبلغ عنها عبر المكالمة الهاتفية', '--color-green-200', 'phone', 4, @adminUserId, @adminUserId),
    ('In-Person', 'شخصياً', 'Cases reported in person at office', 'الحالات المبلغ عنها شخصياً في المكتب', '--color-purple-200', 'user', 5, @adminUserId, @adminUserId),
    ('Social Media', 'وسائل التواصل الاجتماعي', 'Cases reported through social media platforms', 'الحالات المبلغ عنها عبر منصات وسائل التواصل الاجتماعي', '--color-pink-200', 'share-2', 6, @adminUserId, @adminUserId),
    ('Partner Organization', 'منظمة شريكة', 'Cases referred by partner organizations', 'الحالات المحولة من المنظمات الشريكة', '--color-orange-200', 'users', 7, @adminUserId, @adminUserId),
    ('Other', 'أخرى', 'Cases received through other channels', 'الحالات المستلمة عبر قنوات أخرى', '--color-gray-200', 'more-horizontal', 8, @adminUserId, @adminUserId);

  PRINT '✅ Initial case channels inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Case channels already exist';
END`;
// Provider Types
export const insertInitialProviderTypesScript = `
IF NOT EXISTS (SELECT * FROM ProviderTypes WHERE name = 'Individual Beneficiary')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO ProviderTypes (name, arabicName, description, arabicDescription, color, icon, sortOrder, createdBy, updatedBy)
  VALUES
    ('Individual Beneficiary', 'مستفيد فردي', 'Individual person receiving services', 'شخص فردي يتلقى الخدمات', '--color-blue-200', 'user', 1, @adminUserId, @adminUserId),
    ('Group of Beneficiaries', 'مجموعة مستفيدين', 'Group of people receiving services', 'مجموعة من الأشخاص يتلقون الخدمات', '--color-green-200', 'users', 2, @adminUserId, @adminUserId),
    ('Community Representative', 'ممثل المجتمع', 'Representative speaking on behalf of community', 'ممثل يتحدث نيابة عن المجتمع', '--color-orange-200', 'speaker', 3, @adminUserId, @adminUserId),
    ('Partner Organization', 'منظمة شريكة', 'Partner organization providing feedback', 'منظمة شريكة تقدم التعليقات', '--color-purple-200', 'building', 4, @adminUserId, @adminUserId),
    ('Government Entity', 'جهة حكومية', 'Government entity or official', 'جهة أو مسؤول حكومي', '--color-red-200', 'landmark', 5, @adminUserId, @adminUserId),
    ('Staff Member', 'عضو طاقم', 'Internal staff member', 'عضو طاقم داخلي', '--color-cyan-200', 'id-card', 6, @adminUserId, @adminUserId),
    ('Anonymous', 'مجهول', 'Anonymous feedback provider', 'مقدم تعليقات مجهول', '--color-gray-200', 'user-x', 7, @adminUserId, @adminUserId);

  PRINT '✅ Initial provider types inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  Provider types already exist';
END`;

// System Settings
export const insertInitialSystemSettingsScript = `
IF NOT EXISTS (SELECT * FROM SystemSettings WHERE settingKey = 'app.name')
BEGIN
  -- Get the admin user ID for createdBy and updatedBy
  DECLARE @adminUserId INT = (SELECT TOP 1 id FROM Users WHERE role = 'super_admin');
  
  INSERT INTO SystemSettings (settingKey, settingValue, settingType, category, displayName, description, defaultValue, isPublic, createdBy, updatedBy)
  VALUES
    ('app.name', 'Sunflower CFM', 'string', 'general', 'Application Name', 'Name of the application displayed in UI', 'Sunflower CFM', 1, @adminUserId, @adminUserId),
    ('app.version', '1.0.0', 'string', 'general', 'Application Version', 'Current version of the application', '1.0.0', 1, @adminUserId, @adminUserId),
    ('case.number.prefix', 'CFM', 'string', 'general', 'Case Number Prefix', 'Prefix for auto-generated case numbers', 'CFM', 0, @adminUserId, @adminUserId),
    ('case.auto.assignment', 'false', 'boolean', 'general', 'Auto Assignment', 'Automatically assign new cases', 'false', 0, @adminUserId, @adminUserId),
    ('notification.email.enabled', 'true', 'boolean', 'notification', 'Email Notifications', 'Enable email notifications', 'true', 0, @adminUserId, @adminUserId),
    ('notification.push.enabled', 'true', 'boolean', 'notification', 'Push Notifications', 'Enable push notifications', 'true', 0, @adminUserId, @adminUserId),
    ('sla.default.response.hours', '24', 'number', 'sla', 'Default Response Time', 'Default response time in hours', '24', 0, @adminUserId, @adminUserId),
    ('sla.default.resolution.hours', '168', 'number', 'sla', 'Default Resolution Time', 'Default resolution time in hours (7 days)', '168', 0, @adminUserId, @adminUserId),
    ('security.session.timeout.minutes', '480', 'number', 'security', 'Session Timeout', 'Session timeout in minutes (8 hours)', '480', 0, @adminUserId, @adminUserId),
    ('security.max.login.attempts', '5', 'number', 'security', 'Max Login Attempts', 'Maximum failed login attempts before lockout', '5', 0, @adminUserId, @adminUserId);
  
  PRINT '✅ Initial system settings inserted successfully';
END
ELSE
BEGIN
  PRINT 'ℹ️  System settings already exist';
END`;
