


export const sessionOptions = {
  password: process.env.SECRET_KEY,
  cookieName: "Dezy",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
};

