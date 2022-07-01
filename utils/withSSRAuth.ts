import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";
import decode from "jwt-decode";
import { validadeUserPermissions } from "./validateUserPremissions";

type WithSSRAuthOptions = {
  permissions: string[];
  roles: string[];
};

// HOF
export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: WithSSRAuthOptions
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies["nextauth.token"];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (options) {
      const userFromToken = decode<{ permissions: string[]; roles: string[] }>(
        token
      );
      const { permissions, roles } = options;

      const userHasValidPermissions = validadeUserPermissions({
        user: userFromToken,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: "/dashboard",
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, "nextauth.token");
        destroyCookie(ctx, "nextauth.tokenRefresh");

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
