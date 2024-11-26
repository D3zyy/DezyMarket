import React from "react";
import { getSession } from "../authentication/actions";
import ProfileNavBarClient from "./ProfileNavBarClient";

const ProfileNavBar = async () => {
  const session = await getSession();
  const sessionParsed = JSON.parse(JSON.stringify(session))
  return <ProfileNavBarClient session={sessionParsed} />;
};

export default ProfileNavBar;