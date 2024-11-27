"use server";
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/app/database/db';
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '@/app/api/email/email';
import { headers } from "next/headers";
import { DateTime } from 'luxon';

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
  .regex(
    /^[A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]{2,} [A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž]{2,}$/,
    'Celé jméno musí mít formát "Jméno Příjmení", kde obě části mají alespoň 2 znaky, obsahují pouze písmena včetně českých znaků a mezi nimi je jedna mezera.'
  ),
    nickname: z.string()
    .min(4, 'Přezdívka musí mít alespoň 4 znaky.')
    .max(10, 'Přezdívka může mít maximálně 10 znaků.')
    .regex(/^(?!.*Dezy).*$/, 'Tato přezdívka není dostupná.')
    .regex(/^[A-Za-z0-9]+$/, 'Přezdívka smí obsahovat pouze písmena a čísla.'),
  termsOfUseAndPrivatePolicy: z.boolean()
    .refine(val => val === true, 'Musíte souhlasit s podmínkami použití a zásadami zpracování osobních údajů.')
});

export const handleRegistration = async (formData) => {
  const validatedFields = schema.safeParse({
    email: formData.email,
    password: formData.password,
    fullName: formData.fullName,
    nickname: formData.nickname,
    termsOfUseAndPrivatePolicy: formData.termsOfUseAndPrivatePolicy === 'on',
  });

  if (!validatedFields.success) {
    return {
      message: JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  try {
    
    //Kontorla zda již přezdvíka existuje
    const existingNickname= await prisma.Users.findUnique({
      where: {
        nickname: validatedFields.data.nickname,
      }
    });

    if (existingNickname) {
      return {
        message: "Přezdívka již existuje.",
      };
    }
    // Zkontrolujte, zda uživatel s daným e-mailem již existuje
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
    

    // Hash hesla
    const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

    // Získejte ID role pro roli "uživatel"
    const role = await prisma.Roles.findUnique({
      where: {
        name: 'uzivatel'
      }
    });


      let registrationMail = validatedFields.data.email
  
    if (!role) {
      return {
        message: "Chyba na serveru",
      };
    }
 
  // Získání aktuálního českého času
  const localISODateFixedOffset = DateTime.now()
  .setZone('Europe/Prague') // Čas zůstane v českém pásmu
  .toFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'"); // Pevně přidá offset "+00:00"

console.log(localISODateFixedOffset); // Např. "2024-11-26T23:10:30+00:00"

    // Uložení uživatele do databáze
  const createdUser =   await prisma.Users.create({
      data: {
        dateOfRegistration: localISODateFixedOffset,
        email: validatedFields.data.email,
        password: hashedPassword,
        fullName: validatedFields.data.fullName,
        nickname: validatedFields.data.nickname,
        termsOfUseAndPrivatePolicy: validatedFields.data.termsOfUseAndPrivatePolicy,
        roleId: role.id,
      }
    });
    
    const rawIp =
  headers().get("x-forwarded-for")?.split(",")[0] || // První adresa v řetězci
  headers().get("x-real-ip") ||                      // Alternativní hlavička                   // Lokální fallback
  null;

// Odstranění případného prefixu ::ffff:
const ip = rawIp?.startsWith("::ffff:") ? rawIp.replace("::ffff:", "") : rawIp;

console.log("IP adresa :", ip);



// Najít existující IP adresu v databázi
let ipToRegister = await prisma.ipAddresses.findFirst({
  where: { value: ip },
});

if (!ipToRegister) {
  // Pokud IP adresa neexistuje, vytvoříme ji
  ipToRegister = await prisma.ipAddresses.create({
    data: { value: ip },
  });
}

// Zkontrolovat, zda uživatel již má tuto IP přiřazenou
const ipToRegisterAlreadyExistWithThatUser = await prisma.ipAddressesOnUsers.findFirst({
  where: {
    ipAddressId: ipToRegister.id,
    userId: createdUser.id,
  },
});

if (!ipToRegisterAlreadyExistWithThatUser) {
  // Vytvoříme relaci mezi IP adresou a uživatelem, pokud neexistuje
  await prisma.ipAddressesOnUsers.create({
    data: {
      ipAddressId: ipToRegister.id,
      userId: createdUser.id,
    },
  });
}
console.log("IP:",ip)
console.log("Již exstuje ip adresa :",ipToRegister)
console.log("Již má uživatel tuto ip adresu",ipToRegisterAlreadyExistWithThatUser)

    // Odeslání verifikačního emailu
    const result = await sendVerificationEmail(validatedFields.data.email);

    if (result) {
      return {
        message: "",
        closeModal: true,
      };
    } else {
      // Pokud selže odeslání emailu, smažte uživatele
      await prisma.Users.delete({
        where: {
          email: validatedFields.data.email,
        },
      });
      return {
        message: "Chyba při odesílání verifikačního emailu.\n Registrace nebyla úspěšná.",
      };
    }

  } catch (error) {
    console.error("Database error:", error);
    return {
      message: "Chyba při registraci, zkuste to prosím znovu později.",
    };
  } finally {
    await prisma.$disconnect(); // Uzavřete připojení po dokončení
  }
};