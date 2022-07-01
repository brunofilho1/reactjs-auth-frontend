import { useContext, useEffect } from "react";
import { AuthContext, signOut } from "../contexts/AuthContext";
import { setupAuthClient } from "../services/api";
import styles from "../styles/Home.module.css";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className={styles.container}>
      <div>
        <h1>Metrics</h1>
      </div>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAuthClient(ctx);
    const response = await apiClient.get("/me");
    console.log(response);

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
