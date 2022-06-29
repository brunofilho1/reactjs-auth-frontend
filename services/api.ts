import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { toast } from "react-toastify";
import { signOut } from "../contexts/AuthContext";

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        // renovar o token
        cookies = parseCookies();

        const originalConfig = error.config;

        const { "nextauth.refreshToken": refreshToken } = cookies;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              console.log("/refresh ==> ", response);
              const { token } = response.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: "/", // qualquer endereço terá acesso
              });
              setCookie(
                undefined,
                "nextauth.refreshToken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30, // 30 dias
                  path: "/", // qualquer endereço terá acesso
                }
              );

              api.defaults.headers["Authorization"] = `Bearer ${token}`;

              failedRequestQueue.forEach((request) => request.resolve(token));
              failedRequestQueue = [];
            })
            .catch((error) => {
              failedRequestQueue.forEach((request) => request.reject(error));
              failedRequestQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            resolve: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            reject: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      } else {
        signOut();
      }
    }

    return Promise.reject(error);
  }
);
