/**
 * Function to generate an SQL query for inserting feedback data into the Feedback table.
 * @param {Object} feedbackObj - An object containing feedback data.
 *
 */
export const insertFeedbackQuery = (feedbackObj) => {
  if (!feedbackObj || typeof feedbackObj !== "object") {
    throw new Error("Invalid feedback object provided");
  }

  // Extract keys and values from the feedback object
  // and construct the SQL query dynamically, excluding the null values
  const nonNullFeedback = Object.fromEntries(
    Object.entries(feedbackObj).filter(([_, value]) => value !== null)
  );

  const keys = Object.keys(nonNullFeedback);
  const values = keys.map((key) => `@${key}`);
  const query = `
    INSERT INTO Feedback (${keys.join(", ")})
    VALUES (${values.join(", ")})
  `;
  return query;
};

/** * Function to transform the result of a feedback query into a structured object.
 * @param {Object} result - The result object from the database query.
 * @returns {Object} - A structured feedback object.
 */
export const transformFeedbackResult = (result) => {
  return {
    id: result.id,
    feedbackNumber: result.feedbackNumber,
    feedbackDate: result.feedbackDate,
    title: result.title,
    description: result.description,
    category: {
      id: result.category,
      name: result.categoryName,
      arabicName: result.categoryArabicName,
      description: result.categoryDescription,
      arabicDescription: result.categoryArabicDescription,
    },
    priority: result.priority,
    status: result.status,
    feedbackChannel: {
      id: result.feedbackChannel,
      name: result.feedbackChannelName,
      arabicName: result.feedbackChannelArabicName,
      description: result.feedbackChannelDescription,
      arabicDescription: result.feedbackChannelArabicDescription,
    },
    impactDescription: result.impactDescription,
    programmeId: result.programmeId,
    isProjectRelated: result.isProjectRelated,
    projectId: result.projectId,
    activityId: result.activityId,
    providerType: {
      id: result.providerType,
      name: result.providerTypeName,
    },
    individualProviderGender: result.individualProviderGender,
    individualProviderAgeGroup: result.individualProviderAgeGroup,
    individualProviderDisabilityStatus:
      result.individualProviderDisabilityStatus,
    groupProviderNumberOfIndividuals: result.groupProviderNumberOfIndividuals,
    groupProviderGenderComposition: result.groupProviderGenderComposition,
    dataSharingConsent: result.dataSharingConsent,
    consentToFollowUp: result.consentToFollowUp,
    followUpContactMethod: result.followUpContactMethod,
    providerName: result.providerName,
    providerEmail: result.providerEmail,
    providerPhone: result.providerPhone,
    providerOrganization: result.providerOrganization,
    providerAddress: result.providerAddress,
    submittedBy: {
      id: result.submittedBy,
      username: result.submittedByUsername,
      email: result.submittedByEmail,
      firstName: result.submittedByFirstName,
      lastName: result.submittedByLastName,
    },
    submittedAt: result.submittedAt,
    submittedByInitials: result.submittedByInitials,
    submittedByConfirmation: result.submittedByConfirmation,
    submittedByComments: result.submittedByComments,
    assignedTo: {
      id: result.assignedTo,
      username: result.assignedToUsername,
      email: result.assignedToEmail,
      firstName: result.assignedToFirstName,
      lastName: result.assignedToLastName,
    },
    assignedBy: {
      id: result.assignedBy,
      username: result.assignedByUsername,
      email: result.assignedByEmail,
      firstName: result.assignedByFirstName,
      lastName: result.assignedByLastName,
    },
    assignedAt: result.assignedAt,
    community: {
      id: result.community,
      name: result.communityName,
      arabicName: result.communityArabicName,
    },
    governorate: {
      id: result.governorateId,
      name: result.governorateName,
      arabicName: result.governorateArabicName,
    },
    region: {
      id: result.regionId,
      name: result.regionName,
      arabicName: result.regionArabicName,
    },
    location: result.location,
    latitude: result.latitude,
    longitude: result.longitude,
    tags: result.tags,
    attachments: result.attachments,
    isSensitive: result.isSensitive,
    isAnonymized: result.isAnonymized,
    isPublic: result.isPublic,
    privacyPolicyAccepted: result.privacyPolicyAccepted,
    createdAt: result.createdAt,
    createdBy: {
      id: result.createdBy,
      username: result.createdByUsername,
      email: result.createdByEmail,
      firstName: result.createdByFirstName,
      lastName: result.createdByLastName,
    },
    updatedAt: result.updatedAt,
    updatedBy: {
      id: result.updatedBy,
      username: result.updatedByUsername,
      email: result.updatedByEmail,
      firstName: result.updatedByFirstName,
      lastName: result.updatedByLastName,
    },
    isDeleted: result.isDeleted,
    deletedAt: result.deletedAt,
    isActive: result.isActive,
  };
};

export const selectFeedbackQuery = `
  SELECT 
    -- All Feedback fields
    f.*,

    -- Feedback category details
    fc.name AS categoryName,
    fc.arabicName AS categoryArabicName,
    fc.description AS categoryDescription,
    fc.arabicDescription AS categoryArabicDescription,

    -- Feedback channel details
    fch.name AS feedbackChannelName,
    fch.arabicName AS feedbackChannelArabicName,
    fch.description AS feedbackChannelDescription,
    fch.arabicDescription AS feedbackChannelArabicDescription,

    -- program details
    p.name AS programName,

    -- project details
    pr.name AS projectName,

    -- activity details
    a.name AS activityName,

    -- provider details
    pt.name AS providerTypeName,

    -- submitted by user details
    sb.username AS submittedByUsername,
    sb.email AS submittedByEmail,
    sb.firstName AS submittedByFirstName,
    sb.lastName AS submittedByLastName,

    -- assigned to user details
    at.username AS assignedToUsername,
    at.email AS assignedToEmail,
    at.firstName AS assignedToFirstName,
    at.lastName AS assignedToLastName,

    -- assigned by user details
    ab.username AS assignedByUsername,
    ab.email AS assignedByEmail,
    ab.firstName AS assignedByFirstName,
    ab.lastName AS assignedByLastName,

    -- community details
    c.name AS communityName,
    c.arabicName AS communityArabicName,
    g.name AS governerateName,
    g.arabicName AS governerateArabicName,
    r.name AS regionName,
    r.arabicName AS regionArabicName,

    -- created by user details
    cu.username AS createdByUsername,
    cu.email AS createdByEmail,
    cu.firstName AS createdByFirstName,
    cu.lastName AS createdByLastName,
    
    -- updated by user details
    uu.username AS updatedByUsername,
    uu.email AS updatedByEmail,
    uu.firstName AS updatedByFirstName,
    uu.lastName AS updatedByLastName

  FROM Feedback f
  LEFT JOIN FeedbackCategories fc ON f.category = fc.id
  LEFT JOIN FeedbackChannels fch ON f.feedbackChannel = fch.id
  LEFT JOIN Programmes p ON f.programmeId = p.id
  LEFT JOIN Projects pr ON f.projectId = pr.id
  LEFT JOIN Activities a ON f.activityId = a.id
  LEFT JOIN ProviderTypes pt ON f.providerType = pt.id
  LEFT JOIN Users sb ON f.submittedBy = sb.id
  LEFT JOIN Users at ON f.assignedTo = at.id
  LEFT JOIN Users ab ON f.assignedBy = ab.id
  LEFT JOIN Communities c ON f.community = c.id
  LEFT JOIN Governerates g ON c.governerateId = g.id
  LEFT JOIN Regions r ON g.regionId = r.id
  LEFT JOIN Users cu ON f.createdBy = cu.id
  LEFT JOIN Users uu ON f.updatedBy = uu.id
`;

/** * Function to generate a SQL query for selecting feedback data with optional filters.
 * @param {Object} options - An object containing optional parameters for filtering, ordering, and pagination.
 * @param {string} [options.where] - A string representing the WHERE clause for filtering.
 * @param {string} [options.orderBy] - A string representing the ORDER BY clause for sorting.
 * @param {number} [options.limit] - A number representing the maximum number of records to return.
 * @param {number} [options.offset] - A number representing the offset for pagination.
 * @param {string} [options.groupBy] - A string representing the GROUP BY clause for grouping records.
 * @param {string} [options.having] - A string representing the HAVING clause for filtering grouped records.
 * @returns {string} - A SQL query string for selecting feedback data.
 */
export const selectFeedbackQueryFn = (options = {}) => {
  return `
  ${selectFeedbackQuery}
  ${options.where ? `WHERE ${options.where}` : ""}
  ${options.orderBy ? `ORDER BY ${options.orderBy}` : ""}
  ${
    options.limit
      ? `OFFSET ${options.offset} ROWS FETCH NEXT ${options.limit} ROWS ONLY`
      : ""
  }
  ${options.groupBy ? `GROUP BY ${options.groupBy}` : ""}
  ${options.having ? `HAVING ${options.having}` : ""}
  `;
};

/*
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
          tags NVARCHAR(255) NULL,
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
*/
