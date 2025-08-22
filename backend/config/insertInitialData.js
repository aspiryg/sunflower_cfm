export const insertAdminUserScript = `
          INSERT INTO Users (username, email, password, firstName, lastName, role, organization, isActive, isVerified)
          VALUES (@username, @email, @password, @firstName, @lastName, @role, @organization, @isActive, @isVerified)
        `;
export const LogCreatedAdminUserScript = `
            IF NOT EXISTS (SELECT * FROM AuditLogs WHERE action = 'SYSTEM_INIT')
            BEGIN
              INSERT INTO AuditLogs (userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent)
                VALUES (@userId, 'SYSTEM_INIT', 'Users', 1, NULL, 'Initial admin user created', '<IP_ADDRESS>', '<USER_AGENT>')
            END
          `;
// Positive feedback, Request for assistance, Minor dissatisfaction with an activity, Major dissatisfaction with an activity
export const insertInitialCategoriesScript = `
        IF NOT EXISTS (SELECT * FROM FeedbackCategories)
        BEGIN
          INSERT INTO FeedbackCategories (name, description)
          VALUES
            ('Positive Feedback', 'Feedback indicating satisfaction with the service'),
            ('Request for Assistance', 'Feedback requesting help or support'),
            ('Minor Dissatisfaction', 'Feedback indicating slight dissatisfaction'),
            ('Major Dissatisfaction', 'Feedback indicating significant dissatisfaction')
        END
`;
// insert initial regions into the database (West Bank, Gaza Strip, Jerusalem)
export const insertInitialRegionsScript = `
        IF NOT EXISTS (SELECT * FROM Regions)
        BEGIN
          INSERT INTO Regions (name, description)
          VALUES
            ('West Bank', 'Region in the Middle East'),
            ('Gaza Strip', 'Region in the Middle East'),
            ('Jerusalem', 'Capital city of Israel')
        END
`;

// insert initial provider types into the database (Individual Beneficiary, Group of Beneficiaries, Organization, Contractor, Supplier, Community)
export const insertInitialProviderTypesScript = `
        IF NOT EXISTS (SELECT * FROM ProviderTypes)
        BEGIN
          INSERT INTO ProviderTypes (name, description)
          VALUES
            ('Individual Beneficiary', 'An individual who benefits from the services'),
            ('Group of Beneficiaries', 'A group of individuals who benefit from the services'),
            ('Organization', 'An organization that benefits from the services'),
            ('Contractor', 'A contractor providing services'),
            ('Supplier', 'A supplier providing goods or services'),
            ('Community', 'A community group benefiting from the services')
        END
`;

// insert initial Feedback Channels into the database (Email, Phone, In-Person, Online Form)
export const insertInitialFeedbackChannelsScript = `
        IF NOT EXISTS (SELECT * FROM FeedbackChannels)
        BEGIN
          INSERT INTO FeedbackChannels (name, description)
          VALUES
            ('Email', 'Feedback received via email'),
            ('Phone', 'Feedback received via phone call'),
            ('In-Person', 'Feedback received in person'),
            ('Online Form', 'Feedback submitted through an online form')
        END
`;
