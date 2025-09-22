import { currentUser } from "@clerk/nextjs/server";

const authAdmin = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      console.log("❌ No user found");
      return false;
    }

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
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
