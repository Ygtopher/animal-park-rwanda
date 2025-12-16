
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const email = 'nsechris7@gmail.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('User already exists. Updating role to ADMIN...');
            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    role: UserRole.ADMIN,
                    password: hashedPassword, // Update password just in case
                },
            });
            console.log('✅ User updated to ADMIN successfully:', updatedUser.email);
        } else {
            console.log('Creating new ADMIN user...');
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName: 'Chris',
                    lastName: 'Admin',
                    role: UserRole.ADMIN,
                },
            });
            console.log('✅ Admin user created successfully:', newUser.email);
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
