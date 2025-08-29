export const enum SWAGGER_ENUMS {
  // User endpoints
  GET_USER_BY_TOKEN = 'Get user by authentication token',
  GET_USER_BY_ID = 'Get user by ID',
  CREATE_USER = 'Create new user',
  UPDATE_USER = 'Update user information',
  DELETE_USER = 'Delete user',
  
  // Authentication endpoints
  LOGIN = 'User login',
  REGISTER = 'User registration',
  LOGOUT = 'User logout',
  REFRESH_TOKEN = 'Refresh authentication token',
  
  // Password management
  FORGOT_PASSWORD = 'Forgot password request',
  RESET_PASSWORD = 'Reset password',
  CHANGE_PASSWORD = 'Change password',
  
  // File operations
  UPLOAD_FILE = 'Upload file to S3',
  DELETE_FILE = 'Delete file from S3',
  GET_FILE = 'Get file from S3',
}
