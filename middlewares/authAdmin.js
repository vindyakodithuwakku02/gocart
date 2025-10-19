import { auth } from "@clerk/nextjs/server";

const authAdmin = async () => {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId || !sessionClaims?.email) {
      console.log("❌ No user or email found");
      return false;
    }

    const email = sessionClaims.email.toLowerCase();
    const adminList = process.env.ADMIN_EMAIL?.split(",").map(e => e.trim().toLowerCase()) || [];

    console.log("🔍 Logged-in email:", email);
    console.log("🔐 Admin list:", adminList);

    return adminList.includes(email);
  } catch (error) {
    console.error("authAdmin error:", error);
    return false;
  }
};

export default authAdmin;