import { auth } from "../../lib/auth";

export const getSessionFromAccessToken = async (accessToken: string) => {
  return auth.api.getSession({
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
};
