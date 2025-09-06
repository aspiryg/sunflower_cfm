/**
 * Function to generate an SQL query for inserting case data into the Cases table.
 * @param {Object} caseObj - An object containing case data.
 * @returns {string} - SQL INSERT query string
 */
export const insertCaseQuery = (caseObj) => {
  if (!caseObj || typeof caseObj !== "object") {
    throw new Error("Invalid case object provided");
  }

  // Extract keys and values from the case object
  // and construct the SQL query dynamically, excluding the null values
  const nonNullCase = Object.fromEntries(
    Object.entries(caseObj).filter(
      ([_, value]) => value !== null && value !== undefined
    )
  );

  const keys = Object.keys(nonNullCase);
  const values = keys.map((key) => `@${key}`);

  const query = `
    INSERT INTO Cases (${keys.join(", ")})
    VALUES (${values.join(", ")})
  `;
  return query;
};

/**
 * Function to transform the result of a case query into a structured object.
 * @param {Object} result - The result object from the database query.
 * @returns {Object} - A structured case object.
 */
export const transformCaseResult = (result) => {
  return {
    id: result.id,
    caseNumber: result.caseNumber,
    title: result.title,
    description: result.description,
    caseDate: result.caseDate,
    dueDate: result.dueDate,
    resolvedDate: result.resolvedDate,

    // Classification
    category: {
      id: result.categoryId,
      name: result.categoryName,
      arabicName: result.categoryArabicName,
      description: result.categoryDescription,
      arabicDescription: result.categoryArabicDescription,
      color: result.categoryColor,
      icon: result.categoryIcon,
    },
    priority: {
      id: result.priorityId,
      name: result.priorityName,
      arabicName: result.priorityArabicName,
      description: result.priorityDescription,
      arabicDescription: result.priorityArabicDescription,
      level: result.priorityLevel,
      color: result.priorityColor,
      icon: result.priorityIcon,
      responseTimeHours: result.priorityResponseTimeHours,
      resolutionTimeHours: result.priorityResolutionTimeHours,
      escalationTimeHours: result.priorityEscalationTimeHours,
    },
    status: {
      id: result.statusId,
      name: result.statusName,
      arabicName: result.statusArabicName,
      description: result.statusDescription,
      arabicDescription: result.statusArabicDescription,
      color: result.statusColor,
      icon: result.statusIcon,
      isInitial: result.statusIsInitial,
      isFinal: result.statusIsFinal,
      allowReopen: result.statusAllowReopen,
    },
    channel: {
      id: result.channelId,
      name: result.channelName,
      arabicName: result.channelArabicName,
      description: result.channelDescription,
      arabicDescription: result.channelArabicDescription,
      color: result.channelColor,
      icon: result.channelIcon,
    },

    // Impact & Urgency
    impactDescription: result.impactDescription,
    urgencyLevel: result.urgencyLevel,
    affectedBeneficiaries: result.affectedBeneficiaries,

    // Related Programme/Project/Activity
    program: result.programId
      ? {
          id: result.programId,
          name: result.programName,
          arabicName: result.programArabicName,
          code: result.programCode,
        }
      : null,
    project: result.projectId
      ? {
          id: result.projectId,
          name: result.projectName,
          arabicName: result.projectArabicName,
          code: result.projectCode,
        }
      : null,
    activity: result.activityId
      ? {
          id: result.activityId,
          name: result.activityName,
          arabicName: result.activityArabicName,
          code: result.activityCode,
        }
      : null,
    isProjectRelated: result.isProjectRelated,

    // Provider Information
    providerType: result.providerTypeId
      ? {
          id: result.providerTypeId,
          name: result.providerTypeName,
          arabicName: result.providerTypeArabicName,
          description: result.providerTypeDescription,
          arabicDescription: result.providerTypeArabicDescription,
        }
      : null,
    individualProviderGender: result.individualProviderGender,
    individualProviderAgeGroup: result.individualProviderAgeGroup,
    individualProviderDisabilityStatus:
      result.individualProviderDisabilityStatus,
    groupProviderSize: result.groupProviderSize,
    groupProviderGenderComposition: result.groupProviderGenderComposition,

    // Contact Information
    providerName: result.providerName,
    providerEmail: result.providerEmail,
    providerPhone: result.providerPhone,
    providerOrganization: result.providerOrganization,
    providerAddress: result.providerAddress,

    // Consent & Privacy
    dataSharingConsent: result.dataSharingConsent,
    followUpConsent: result.followUpConsent,
    followUpContactMethod: result.followUpContactMethod,
    privacyPolicyAccepted: result.privacyPolicyAccepted,
    isSensitive: result.isSensitive,
    isAnonymized: result.isAnonymized,
    isPublic: result.isPublic,
    confidentialityLevel: result.confidentialityLevel,

    // Location
    community: result.communityId
      ? {
          id: result.communityId,
          name: result.communityName,
          arabicName: result.communityArabicName,
          governorate: {
            id: result.governorateId,
            name: result.governorateName,
            arabicName: result.governorateArabicName,
            code: result.governorateCode,
            region: {
              id: result.regionId,
              name: result.regionName,
              arabicName: result.regionArabicName,
              code: result.regionCode,
            },
          },
        }
      : null,
    location: result.location,
    coordinates: result.coordinates,

    // Assignment Information
    assignedTo: result.assignedTo
      ? {
          id: result.assignedTo,
          username: result.assignedToUsername,
          email: result.assignedToEmail,
          firstName: result.assignedToFirstName,
          lastName: result.assignedToLastName,
          role: result.assignedToRole,
        }
      : null,
    assignedBy: result.assignedBy
      ? {
          id: result.assignedBy,
          username: result.assignedByUsername,
          email: result.assignedByEmail,
          firstName: result.assignedByFirstName,
          lastName: result.assignedByLastName,
          role: result.assignedByRole,
        }
      : null,
    assignedAt: result.assignedAt,
    assignmentComments: result.assignmentComments,

    // Submission Information
    submittedBy: result.submittedBy
      ? {
          id: result.submittedBy,
          username: result.submittedByUsername,
          email: result.submittedByEmail,
          firstName: result.submittedByFirstName,
          lastName: result.submittedByLastName,
          role: result.submittedByRole,
        }
      : null,
    submittedAt: result.submittedAt,
    submittedByInitials: result.submittedByInitials,
    submittedByConfirmation: result.submittedByConfirmation,
    submittedByComments: result.submittedByComments,

    // Processing Information
    firstResponseDate: result.firstResponseDate,
    lastActivityDate: result.lastActivityDate,
    escalationLevel: result.escalationLevel,
    escalatedAt: result.escalatedAt,
    escalatedBy: result.escalatedBy
      ? {
          id: result.escalatedBy,
          username: result.escalatedByUsername,
          email: result.escalatedByEmail,
          firstName: result.escalatedByFirstName,
          lastName: result.escalatedByLastName,
          role: result.escalatedByRole,
        }
      : null,
    escalationReason: result.escalationReason,

    // Resolution Information
    resolutionSummary: result.resolutionSummary,
    resolutionCategory: result.resolutionCategory,
    resolutionSatisfaction: result.resolutionSatisfaction,

    // Follow-up & Monitoring
    followUpRequired: result.followUpRequired,
    followUpDate: result.followUpDate,
    monitoringRequired: result.monitoringRequired,
    monitoringDate: result.monitoringDate,

    // Quality Assurance
    qualityReviewed: result.qualityReviewed,
    qualityReviewedBy: result.qualityReviewedBy
      ? {
          id: result.qualityReviewedBy,
          username: result.qualityReviewedByUsername,
          email: result.qualityReviewedByEmail,
          firstName: result.qualityReviewedByFirstName,
          lastName: result.qualityReviewedByLastName,
          role: result.qualityReviewedByRole,
        }
      : null,
    qualityReviewedAt: result.qualityReviewedAt,
    qualityScore: result.qualityScore,
    qualityComments: result.qualityComments,

    // Metadata
    tags: result.tags,
    attachments: result.attachments ? JSON.parse(result.attachments) : null,
    externalReferences: result.externalReferences,

    // Audit Information
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    createdBy: result.createdBy
      ? {
          id: result.createdBy,
          username: result.createdByUsername,
          email: result.createdByEmail,
          firstName: result.createdByFirstName,
          lastName: result.createdByLastName,
          role: result.createdByRole,
        }
      : null,
    updatedBy: result.updatedBy
      ? {
          id: result.updatedBy,
          username: result.updatedByUsername,
          email: result.updatedByEmail,
          firstName: result.updatedByFirstName,
          lastName: result.updatedByLastName,
          role: result.updatedByRole,
        }
      : null,

    // Status Flags
    isActive: result.isActive,
    isDeleted: result.isDeleted,
    deletedAt: result.deletedAt,
    deletedBy: result.deletedBy
      ? {
          id: result.deletedBy,
          username: result.deletedByUsername,
          email: result.deletedByEmail,
          firstName: result.deletedByFirstName,
          lastName: result.deletedByLastName,
          role: result.deletedByRole,
        }
      : null,
  };
};

/**
 * Comprehensive SELECT query with all related table joins
 */
export const selectCaseQuery = `
  SELECT 
    -- Core Case fields
    c.*,

    -- Category details
    cat.name AS categoryName,
    cat.arabicName AS categoryArabicName,
    cat.description AS categoryDescription,
    cat.arabicDescription AS categoryArabicDescription,
    cat.color AS categoryColor,
    cat.icon AS categoryIcon,

    -- Priority details
    pri.name AS priorityName,
    pri.arabicName AS priorityArabicName,
    pri.description AS priorityDescription,
    pri.arabicDescription AS priorityArabicDescription,
    pri.level AS priorityLevel,
    pri.color AS priorityColor,
    pri.icon AS priorityIcon,
    pri.responseTimeHours AS priorityResponseTimeHours,
    pri.resolutionTimeHours AS priorityResolutionTimeHours,
    pri.escalationTimeHours AS priorityEscalationTimeHours,

    -- Status details
    st.name AS statusName,
    st.arabicName AS statusArabicName,
    st.description AS statusDescription,
    st.arabicDescription AS statusArabicDescription,
    st.color AS statusColor,
    st.icon AS statusIcon,
    st.isInitial AS statusIsInitial,
    st.isFinal AS statusIsFinal,
    st.allowReopen AS statusAllowReopen,

    -- Channel details
    ch.name AS channelName,
    ch.arabicName AS channelArabicName,
    ch.description AS channelDescription,
    ch.arabicDescription AS channelArabicDescription,
    ch.color AS channelColor,
    ch.icon AS channelIcon,

    -- Program details
    prog.name AS programName,
    prog.arabicName AS programArabicName,
    prog.code AS programCode,

    -- Project details
    proj.name AS projectName,
    proj.arabicName AS projectArabicName,
    proj.code AS projectCode,

    -- Activity details
    act.name AS activityName,
    act.arabicName AS activityArabicName,
    act.code AS activityCode,

    -- Provider Type details
    pt.name AS providerTypeName,
    pt.arabicName AS providerTypeArabicName,
    pt.description AS providerTypeDescription,
    pt.arabicDescription AS providerTypeArabicDescription,

    -- Community and Location details
    com.name AS communityName,
    com.arabicName AS communityArabicName,
    gov.id AS governorateId,
    gov.name AS governorateName,
    gov.arabicName AS governorateArabicName,
    gov.code AS governorateCode,
    reg.id AS regionId,
    reg.name AS regionName,
    reg.arabicName AS regionArabicName,
    reg.code AS regionCode,

    -- Assigned To user details
    at_user.username AS assignedToUsername,
    at_user.email AS assignedToEmail,
    at_user.firstName AS assignedToFirstName,
    at_user.lastName AS assignedToLastName,
    at_user.role AS assignedToRole,

    -- Assigned By user details
    ab_user.username AS assignedByUsername,
    ab_user.email AS assignedByEmail,
    ab_user.firstName AS assignedByFirstName,
    ab_user.lastName AS assignedByLastName,
    ab_user.role AS assignedByRole,

    -- Submitted By user details
    sb_user.username AS submittedByUsername,
    sb_user.email AS submittedByEmail,
    sb_user.firstName AS submittedByFirstName,
    sb_user.lastName AS submittedByLastName,
    sb_user.role AS submittedByRole,

    -- Escalated By user details
    eb_user.username AS escalatedByUsername,
    eb_user.email AS escalatedByEmail,
    eb_user.firstName AS escalatedByFirstName,
    eb_user.lastName AS escalatedByLastName,
    eb_user.role AS escalatedByRole,

    -- Quality Reviewed By user details
    qr_user.username AS qualityReviewedByUsername,
    qr_user.email AS qualityReviewedByEmail,
    qr_user.firstName AS qualityReviewedByFirstName,
    qr_user.lastName AS qualityReviewedByLastName,
    qr_user.role AS qualityReviewedByRole,

    -- Created By user details
    cb_user.username AS createdByUsername,
    cb_user.email AS createdByEmail,
    cb_user.firstName AS createdByFirstName,
    cb_user.lastName AS createdByLastName,
    cb_user.role AS createdByRole,
    
    -- Updated By user details
    ub_user.username AS updatedByUsername,
    ub_user.email AS updatedByEmail,
    ub_user.firstName AS updatedByFirstName,
    ub_user.lastName AS updatedByLastName,
    ub_user.role AS updatedByRole,

    -- Deleted By user details
    db_user.username AS deletedByUsername,
    db_user.email AS deletedByEmail,
    db_user.firstName AS deletedByFirstName,
    db_user.lastName AS deletedByLastName,
    db_user.role AS deletedByRole

  FROM Cases c
  LEFT JOIN CaseCategories cat ON c.categoryId = cat.id
  LEFT JOIN CasePriority pri ON c.priorityId = pri.id
  LEFT JOIN CaseStatus st ON c.statusId = st.id
  LEFT JOIN CaseChannels ch ON c.channelId = ch.id
  LEFT JOIN Programs prog ON c.programId = prog.id
  LEFT JOIN Projects proj ON c.projectId = proj.id
  LEFT JOIN Activities act ON c.activityId = act.id
  LEFT JOIN ProviderTypes pt ON c.providerTypeId = pt.id
  LEFT JOIN Communities com ON c.communityId = com.id
  LEFT JOIN Governorates gov ON com.governorateId = gov.id
  LEFT JOIN Regions reg ON gov.regionId = reg.id
  LEFT JOIN Users at_user ON c.assignedTo = at_user.id
  LEFT JOIN Users ab_user ON c.assignedBy = ab_user.id
  LEFT JOIN Users sb_user ON c.submittedBy = sb_user.id
  LEFT JOIN Users eb_user ON c.escalatedBy = eb_user.id
  LEFT JOIN Users qr_user ON c.qualityReviewedBy = qr_user.id
  LEFT JOIN Users cb_user ON c.createdBy = cb_user.id
  LEFT JOIN Users ub_user ON c.updatedBy = ub_user.id
  LEFT JOIN Users db_user ON c.deletedBy = db_user.id
`;

/**
 * Function to generate a SQL query for selecting case data with optional filters.
 * @param {Object} options - An object containing optional parameters for filtering, ordering, and pagination.
 * @param {string} [options.where] - A string representing the WHERE clause for filtering.
 * @param {string} [options.orderBy] - A string representing the ORDER BY clause for sorting.
 * @param {number} [options.limit] - A number representing the maximum number of records to return.
 * @param {number} [options.offset] - A number representing the offset for pagination.
 * @param {string} [options.groupBy] - A string representing the GROUP BY clause for grouping records.
 * @param {string} [options.having] - A string representing the HAVING clause for filtering grouped records.
 * @returns {string} - A SQL query string for selecting case data.
 */
export const selectCaseQueryFn = (options = {}) => {
  return `
  ${selectCaseQuery}
  ${options.where ? `WHERE ${options.where}` : ""}
  ${options.groupBy ? `GROUP BY ${options.groupBy}` : ""}
  ${options.having ? `HAVING ${options.having}` : ""}
  ${options.orderBy ? `ORDER BY ${options.orderBy}` : ""}
  ${
    options.limit
      ? `OFFSET ${options.offset || 0} ROWS FETCH NEXT ${
          options.limit
        } ROWS ONLY`
      : ""
  }
  `;
};

/**
 * Gets searchable fields for full-text search.
 * @returns {Array} Array of searchable field names.
 */
export const getSearchableFields = () => {
  return [
    "c.title",
    "c.description",
    "c.caseNumber",
    "c.providerName",
    "c.providerEmail",
    "c.tags",
    "c.resolutionSummary",
    "cat.name",
    "ch.name",
    "com.name",
    "gov.name",
    "reg.name",
    "prog.name",
    "proj.name",
    "act.name",
  ];
};

/**
 * Gets filter mappings for exact match filtering.
 * @returns {Object} Filter mappings.
 */
export const getFilterMappings = () => {
  return {
    id: { field: "c.id", type: "Int" },
    caseNumber: { field: "c.caseNumber", type: "NVarChar" },
    categoryId: { field: "c.categoryId", type: "Int" },
    priorityId: { field: "c.priorityId", type: "Int" },
    statusId: { field: "c.statusId", type: "Int" },
    channelId: { field: "c.channelId", type: "Int" },
    urgencyLevel: { field: "c.urgencyLevel", type: "NVarChar" },
    confidentialityLevel: { field: "c.confidentialityLevel", type: "NVarChar" },
    programId: { field: "c.programId", type: "Int" },
    projectId: { field: "c.projectId", type: "Int" },
    activityId: { field: "c.activityId", type: "Int" },
    communityId: { field: "c.communityId", type: "Int" },
    assignedTo: { field: "c.assignedTo", type: "Int" },
    assignedBy: { field: "c.assignedBy", type: "Int" },
    submittedBy: { field: "c.submittedBy", type: "Int" },
    createdBy: { field: "c.createdBy", type: "Int" },
    providerTypeId: { field: "c.providerTypeId", type: "Int" },
    isProjectRelated: { field: "c.isProjectRelated", type: "Bit" },
    dataSharingConsent: { field: "c.dataSharingConsent", type: "Bit" },
    followUpConsent: { field: "c.followUpConsent", type: "Bit" },
    isSensitive: { field: "c.isSensitive", type: "Bit" },
    isAnonymized: { field: "c.isAnonymized", type: "Bit" },
    isPublic: { field: "c.isPublic", type: "Bit" },
    isActive: { field: "c.isActive", type: "Bit" },
    isDeleted: { field: "c.isDeleted", type: "Bit" },
    escalationLevel: { field: "c.escalationLevel", type: "Int" },
    followUpRequired: { field: "c.followUpRequired", type: "Bit" },
    monitoringRequired: { field: "c.monitoringRequired", type: "Bit" },
    qualityReviewed: { field: "c.qualityReviewed", type: "Bit" },
  };
};

/**
 * Gets valid sort fields for ORDER BY clause.
 * @returns {Object} Valid sort fields mapping.
 */
export const getValidSortFields = () => {
  return {
    id: "c.id",
    caseNumber: "c.caseNumber",
    title: "c.title",
    caseDate: "c.caseDate",
    dueDate: "c.dueDate",
    resolvedDate: "c.resolvedDate",
    priority: "pri.level",
    priorityName: "pri.name",
    status: "st.name",
    category: "cat.name",
    urgencyLevel: "c.urgencyLevel",
    escalationLevel: "c.escalationLevel",
    createdAt: "c.createdAt",
    updatedAt: "c.updatedAt",
    submittedAt: "c.submittedAt",
    assignedAt: "c.assignedAt",
    lastActivityDate: "c.lastActivityDate",
    communityName: "com.name",
    governorateName: "gov.name",
    regionName: "reg.name",
  };
};

/**
 * Gets array filter configurations for comma-separated values.
 * @returns {Object} Array filter configurations.
 */
export const getArrayFilters = () => {
  return {
    categories: { field: "c.categoryId", type: "Int" },
    priorities: { field: "c.priorityId", type: "Int" },
    statuses: { field: "c.statusId", type: "Int" },
    channels: { field: "c.channelId", type: "Int" },
    urgencyLevels: { field: "c.urgencyLevel", type: "NVarChar" },
    confidentialityLevels: {
      field: "c.confidentialityLevel",
      type: "NVarChar",
    },
    communities: { field: "c.communityId", type: "Int" },
    programs: { field: "c.programId", type: "Int" },
    projects: { field: "c.projectId", type: "Int" },
    activities: { field: "c.activityId", type: "Int" },
  };
};

/**
 * Gets date range filter configurations.
 * @returns {Array} Array of date field names.
 */
export const getDateRangeFields = () => {
  return [
    "caseDate",
    "dueDate",
    "resolvedDate",
    "submittedAt",
    "assignedAt",
    "escalatedAt",
    "createdAt",
    "updatedAt",
    "lastActivityDate",
    "followUpDate",
    "monitoringDate",
    "qualityReviewedAt",
  ];
};
