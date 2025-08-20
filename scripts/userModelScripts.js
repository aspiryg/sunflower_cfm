export const INSERT_USER_SCRIPT = `
        INSERT INTO Users (
          username,
          email,
          password,
          firstName,
          lastName,
          profilePicture,
          bio,
          dateOfBirth,
          phone,
          address,
          city,
          state,
          country,
          postalCode,
          role,
          organization
        ) VALUES (
          @username,
          @email,
          @password,
          @firstName,
          @lastName,
          @profilePicture,
          @bio,
          @dateOfBirth,
          @phone,
          @address,
          @city,
          @state,
          @country,
          @postalCode,
          @role,
          @organization
        )`;

export const SELECT_USER_BY_EMAIL = `
  SELECT * FROM Users WHERE email = @email
`;
export const SELECT_USER_BY_ID = `
  SELECT * FROM Users WHERE id = @id
`;
export const SELECT_ALL_USERS = `
  SELECT * FROM Users
`;

export const DELETE_USER_BY_ID = `
  DELETE FROM Users WHERE id = @id
`;
