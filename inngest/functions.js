import { inngest } from './client';
import prisma from '@/lib/prisma';

// Inngest Function to save user data to database
export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-create' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    const { data } = event;
    try {
      await prisma.user.create({
        data: {
          id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          image: data.image_url,
          cart: {}, // ✅ Added cart field
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
);

// Inngest Function to update user data
export const syncUserUpdation = inngest.createFunction(
  { id: 'sync-user-update' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    const { data } = event;
    try {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          image: data.image_url,
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }
);

// Inngest Function to delete user data
export const syncUserDeletion = inngest.createFunction(
  { id: 'sync-user-delete' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    const { data } = event;
    try {
      await prisma.user.delete({
        where: { id: data.id },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
);

//Inngest Function to delete coupon on expiry
// Inngest Function to delete expired coupons
export const deleteCoupononExpiry = inngest.createFunction(
  { id: 'delete-coupon-on-expiry' },
  { event: 'app/coupon.expired' }, 
  async ({ event, step}) => {
    const { data } = event
    const expiryDate = new Date ( data.expires_at)
    await step.sleepUntil('wait-for-expiry' , expiryDate)
    
    await step.run('delete-coupon-from-database',async () => {
      await prisma.coupon.delete({
        where: { code: data.code}
      })
    })
  }
);
