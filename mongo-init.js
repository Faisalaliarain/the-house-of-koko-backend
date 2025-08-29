// MongoDB initialization script for The project-name
var db = db.getSiblingDB('the_project-name');

// Create the users collection with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be at least 6 characters'
        },
        firstName: {
          bsonType: 'string',
          minLength: 1,
          description: 'First name is required'
        },
        lastName: {
          bsonType: 'string',
          minLength: 1,
          description: 'Last name is required'
        },
        isBlocked: {
          bsonType: 'bool',
          description: 'User blocked status'
        },
        isActive: {
          bsonType: 'bool',
          description: 'User active status'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ isBlocked: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

print('MongoDB initialized successfully for The project-name Backend');
