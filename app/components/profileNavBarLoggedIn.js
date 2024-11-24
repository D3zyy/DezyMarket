import React from "react";
import { getSession } from "../authentication/actions";
import ProfileNavBarClient from "./ProfileNavBarClient";

const ProfileNavBar = async () => {
  const session = await getSession();

  return <ProfileNavBarClient session={session} />;
};

export default ProfileNavBar;