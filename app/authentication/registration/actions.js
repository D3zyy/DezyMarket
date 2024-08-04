"use server"
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  email: z.string()
    .email({ message: 'Nesprávný formát emailu.' }),
  password: z.string()
    .min(5, 'Heslo musí mít alespoň 5 znaků.')
    .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno.')
    .regex(/[a-z]/, 'Heslo musí obsahovat alespoň jedno malé písmeno.')
    .regex(/\d/, 'Heslo musí obsahovat alespoň jedno číslo.')
    .regex(/[^A-Za-z0-9]/, 'Heslo musí obsahovat alespoň jeden speciální znak.'),
  firstName: z.string()
    .min(2, 'Jméno musí mít alespoň 2 znaky.')
    .regex(/^\S+$/, 'Jméno nesmí obsahovat mezery.'),
  lastName: z.string()
    .min(2, 'Příjmení musí mít alespoň 2 znaky.')
    .regex(/^\S+$/, 'Příjmení nesmí obsahovat mezery.'),
  nickname: z.string()
    .min(4, 'Přezdívka musí mít alespoň 4 znaky.')
    .regex(/^\S+$/, 'Přezdívka nesmí obsahovat mezery.'),
  termsOfUseAndPrivatePolicy: z.boolean()
    .refine(val => val === true, 'Musíte souhlasit s podmínkami použití a zásadami ochrany osobních údajů.')
});

export const handleRegistration = async (currentState, formData) => {
  console.log("registration HIT with data:", formData);

  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
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
    revalidatePath('/');
    return {
      message: "Registrace úspěšná!",
    };
  }
};