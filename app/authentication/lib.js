
export const defaultSession = {
  userId: null,
  firstName: '',
  secondName: '',
  password: '',
  isLoggedIn: false,
  role: []
};

export const sessionOptions = {
  password: process.env.SECRET_KEY,
  cookieName: "Dezy-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
};

