"use server";
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/app/database/db';
import bcrypt from 'bcrypt';



const schema = z.object({
  email: z.string()
    .email({ message: 'Nesprávný formát emailu.' }),
  password: z.string()
    .max(40, 'Heslo může mít maximálně 40 znaků.')
    .min(6, 'Heslo musí mít alespoň 6 znaků.')
    .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno.')
    .regex(/[a-z]/, 'Heslo musí obsahovat alespoň jedno malé písmeno.')
    .regex(/\d/, 'Heslo musí obsahovat alespoň jedno číslo.'),
  fullName: z.string()
    .regex(/^[^\s]{2,} [^\s]{2,}$/, 'Celé jméno musí mít formát "Jméno Příjmení", kde obě části mají alespoň 2 znaky a mezi nimi je jedna mezera.'),
  nickname: z.string()
    .min(4, 'Přezdívka musí mít alespoň 4 znaky.')
    .max(10, 'Přezdívka může mít maximalně 10 znaků.')
    .regex(/^(?!.*Dezy).*$/, 'Tato přezdívka není dostupná.')
    .regex(/^\S+$/, 'Přezdívka nesmí obsahovat mezery.'),
  termsOfUseAndPrivatePolicy: z.boolean()
    .refine(val => val === true, 'Musíte souhlasit s podmínkami použití a zásadami ochrany osobních údajů.')
});

export const handleRegistration = async (currentState, formData) => {
  console.log("registration HIT with data:", formData);

  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    nickname: formData.get('nickname'),
    termsOfUseAndPrivatePolicy: formData.get('termsOfUseAndPrivatePolicy') === 'on', // checkbox values are either 'on' or undefined
  });

  if (!validatedFields.success) {
    console.log("error", validatedFields.error.flatten().fieldErrors);
    return {
      message: JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  } else {
    console.log("no error");

    try {
      // Check if the email already exists
      const existingUser = await prisma.Users.findUnique({
        where: {
          email: validatedFields.data.email,
        }
      });

      if (existingUser) {
        return {
          message: "Email již existuje.",
        };
      }

      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

      // Retrieve the role ID for the "regular" role
      const role = await prisma.Roles.findUnique({
        where: {
          name: 'regular'
        }
      });

      if (!role) {
        return {
          message: "Chyba na serveru",
        };
      }

      // Add user to the database
      await prisma.Users.create({
        data: {
          email: validatedFields.data.email,
          password: hashedPassword,
          fullName: validatedFields.data.fullName,
          nickname: validatedFields.data.nickname,
          termsOfUseAndPrivatePolicy: validatedFields.data.termsOfUseAndPrivatePolicy,
          roleId: role.id,
        },
      });

      revalidatePath('/');
      return {
        message: "Registrace úspěšná!",
      };
    } catch (error) {
      console.error("Database error:", error);
      return {
        message: "Chyba při registraci, zkuste to prosím znovu později.",
      };
    }
  }
};