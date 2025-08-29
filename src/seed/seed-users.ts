import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../shared/user/user.service';
import { UserRole } from '../utils/enums/roles.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  console.log('🚀 Starting comprehensive user seeding...\n');

  // Create Super Admin
  const superAdminEmail = 'superadmin@project-name.com';
  const existingSuperAdmin = await userService.findByEmail(superAdminEmail);

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    await userService.createAdmin({
      name: 'Super Administrator',
      email: superAdminEmail,
      password: hashedPassword,
      phoneNumber: '+1234567890',
      agreedToTerms: true,
      role: UserRole.SUPER,
    });
    console.log('✅ Super Admin created:', superAdminEmail);
  } else {
    console.log('ℹ️ Super Admin already exists:', superAdminEmail);
  }

  // Create Admin (project-name Admin)
  const adminEmail = 'admin@project-name.com';
  const existingAdmin = await userService.findByEmail(adminEmail);

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await userService.createAdmin({
      name: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      phoneNumber: '+1234567891',
      agreedToTerms: true,
      role: UserRole.ADMIN,
    });
    console.log('✅ Admin created:', adminEmail);
  } else {
    console.log('ℹ️ Admin already exists:', adminEmail);
  }

  // Create LP User
  const userEmail = 'user@project-name.com';
  const existingUser = await userService.findByEmail(userEmail);

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('LP@123', 10);
    await userService.createUser({
      name: 'User',
      email: userEmail,
      password: hashedPassword,
      phoneNumber: '+1234567892',
      agreedToTerms: true,
      role: UserRole.USER,
      isVerified: true,
      isApproved: true,
      companyProfile: null,
    });
    console.log('✅ User created:', userEmail);
  } else {
    console.log('ℹ️ User already exists:', userEmail);
  }

  // Create Guest User
  const guestEmail = 'guest@project-name.com';
  const existingGuest = await userService.findByEmail(guestEmail);

  if (!existingGuest) {
    const hashedPassword = await bcrypt.hash('Guest@123', 10);
    await userService.createUser({
      name: 'Guest User',
      email: guestEmail,
      password: hashedPassword,
      phoneNumber: '+1234567894',
      agreedToTerms: true,
      role: UserRole.GUEST,
      isVerified: true,
      isApproved: false, // Guests need approval
    });
    console.log('✅ Guest User created:', guestEmail);
  } else {
    console.log('ℹ️ Guest User already exists:', guestEmail);
  }

  console.log('\n🎉 Comprehensive user seeding completed!');
  console.log('\n📋 User Credentials:');
  console.log('Super Admin: superadmin@project-name.com / SuperAdmin@123');
  console.log('Admin: admin@project-name.com / Admin@123');
  console.log('User: user@project-name.com / User@123');
  console.log('Guest User: guest@project-name.com / Guest@123');
  
  console.log('\n🔐 Role Permissions Summary:');
  console.log('SUPER/ADMIN: Full access to all resources');
  console.log('USER: Can create/manage events, view insights, approve registrations');
  console.log('GUEST: Basic view access, can register for events');

  await app.close();
}

bootstrap().catch(error => {
  console.error('❌ Error seeding users:', error);
  process.exit(1);
});
