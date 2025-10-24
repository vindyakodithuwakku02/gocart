import { currentUser } from "@clerk/nextjs/server";

// Returns true if the currently authenticated user is in the ADMIN_EMAIL list
const authAdmin = async () => {
  try {
    // currentUser() reliably returns the Clerk user object (including emails)
    const user = await currentUser();

    if (!user) {
      console.log("❌ No user found");
      return false;
    }

    const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
    if (!email) {
      console.log("❌ No email found on user:", user);
      return false;
    }

    const adminList = process.env.ADMIN_EMAIL?.split(",").map((e) => e.trim().toLowerCase()) || [];

    console.log("🔍 Logged-in email:", email);
    console.log("🔐 Admin list:", adminList);

    return adminList.includes(email);
  } catch (error) {
    console.error("authAdmin error:", error);
    return false;
  }
};

export default authAdmin;