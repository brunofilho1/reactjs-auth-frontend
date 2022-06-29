import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { AuthContext, signOut } from "../contexts/AuthContext";
import { api } from "../services/api";
import styles from "../styles/Home.module.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

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
        <button onClick={() => signOut()}>Sair</button>
      </div>
    </div>
  );
}
