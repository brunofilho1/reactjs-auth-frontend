import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { toast } from "react-toastify";
import { signOut } from "../contexts/AuthContext";

let isRefreshing = false;
let failedRequestQueue = [];

export function setupAuthClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const setupAPIClient = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });

  setupAPIClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response.status === 401) {
        // @ts-ignore
        if (error.response.data?.code === "token.expired") {
          // renovar o token
          cookies = parseCookies(ctx);
          const originalConfig = error.config;
          const { "nextauth.refreshToken": refreshToken } = cookies;

          if (!isRefreshing) {
            isRefreshing = true;

            setupAPIClient
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                console.log("/refresh ==> ", response);
                const { token } = response.data;

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 dias
                  path: "/", // qualquer endereço terá acesso
                });
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 dias
                    path: "/", // qualquer endereço terá acesso
                  }
                );

                setupAPIClient.defaults.headers[
                  "Authorization"
                ] = `Bearer ${token}`;

                failedRequestQueue.forEach((request) => request.resolve(token));
                failedRequestQueue = [];
              })
              .catch((error) => {
                failedRequestQueue.forEach((request) => request.reject(error));
                failedRequestQueue = [];

                if (typeof window !== "undefined") {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              resolve: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                resolve(setupAPIClient(originalConfig));
              },
              reject: (error: AxiosError) => {
                reject(error);
              },
            });
          });
        } else {
          if (typeof window !== "undefined") {
            signOut();
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return setupAPIClient;
}
