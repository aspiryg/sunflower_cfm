/**
 * Returns a user object without sensitive information.
 * @param {*} user - The user object to filter.
 * @returns {*} - The user object without password and verification tokens.
 */
export const returnUserWithoutPassword = (user) => {
  const {
    password,
    verificationToken,
    verificationTokenExpires,
    ...userWithoutPassword
  } = user;
  return userWithoutPassword;
};
