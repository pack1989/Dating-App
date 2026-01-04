import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.union([z.string().min(1), z.literal("")]).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  profilePhotoUrl: z.union([z.string().url(), z.literal("")]).optional()
});

export async function POST(request: Request) {
  try {
    const data = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return Response.json(
        { error: "Email already in use." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const phone = data.phone?.trim() || undefined;
    const profilePhoto = data.profilePhotoUrl?.trim() || undefined;
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone,
        passwordHash,
        profilePhoto
      }
    });

    const token = signToken({ sub: user.id });
    cookies().set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    return Response.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid input." }, { status: 400 });
    }

    return Response.json({ error: "Unable to register." }, { status: 500 });
  }
}
