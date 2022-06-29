import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastContainer autoClose={1000} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
