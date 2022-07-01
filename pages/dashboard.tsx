import Link from "next/link";
import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { UserCanSee } from "../components/UserCanSee";
import { AuthContext } from "../contexts/AuthContext";
import { AuthTokenError } from "../errors/AuthTokenError";
import { useCan } from "../hooks/useCan";
import { setupAuthClient } from "../services/api";
import { api } from "../services/apiClient";
import styles from "../styles/Home.module.css";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/me")
      .then((response) => console.log(response))
      .catch((error) => {
        switch (error.response.data.code) {
          case "token.invalid":
            toast.error("Token inválido, faça login novamente!");
            break;

          default:
            toast.error(error.response.data.message);
            break;
        }
        console.log(error);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div>
        <h1>Dashboard</h1>
        <p>
          Seja bem vindo, <b>{user?.email}</b>!
        </p>

        <UserCanSee permissions={["metrics.list"]}>
          <Link href="/metrics">Você pode acessar as Métricas. 😀</Link>
        </UserCanSee>

        <button onClick={() => signOut()}>Sair</button>
      </div>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAuthClient(ctx);
  const response = await apiClient.get("/me");
  console.log(response);

  return {
    props: {},
  };
});
