import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

const handler = async (req: NextRequest, ctx: any) => {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  const host = forwardedHost || req.headers.get("host");
  
  if (host) {
    process.env.NEXTAUTH_URL = `${forwardedProto}://${host}`;
  }

  return nextAuthHandler(req, ctx);
};

export { handler as GET, handler as POST };
