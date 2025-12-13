import { useProfile } from "../auth/profile-provider";

export const HomePage = () => {
  const { profile } = useProfile();

  return <div>{profile?.avatar}</div>;
};
