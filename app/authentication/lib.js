


export const sessionOptions = {
  password: process.env.SECRET_KEY,
  cookieName: "Dezy",
  cookieOptions: {
    httpOnly: true,
    sameSite: true,
    secure: false,
    maxAge: 50 * 60 * 60, // 50 hours in seconds
  },
};

