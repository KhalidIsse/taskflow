import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    // On sign-in, create the user in MongoDB if needed and keep its id in the token.
    async jwt({ token, user, account }) {
      if (account && user?.email) {
        await connectDB();
        const doc = await User.findOneAndUpdate(
          { email: user.email },
          { $set: { name: user.name ?? "", image: user.image ?? "" } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        token.uid = doc._id.toString();
      }
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid;
      return session;
    },
  },
});
