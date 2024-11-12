import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * メールアドレスでユーザーを検索し、ユーザーデータを取得する関数。
 * @param email ユーザーのメールアドレス
 * @returns ユーザーのデータ（見つからなければ null を返す）
 */
export async function getUserByEmail(email: string) {
  try {
    const usersCollection = collection(db, "users");
    const companiesCollection = collection(db, "companies");

    const userQuery = query(usersCollection, where("email", "==", email));
    const companyQuery = query(companiesCollection, where("email", "==", email));

    const [userSnapshot, companySnapshot] = await Promise.all([
      getDocs(userQuery),
      getDocs(companyQuery),
    ]);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      return { ...userDoc.data(), collection: "users" };
    }

    if (!companySnapshot.empty) {
      const companyDoc = companySnapshot.docs[0];
      return { ...companyDoc.data(), collection: "companies" };
    }

    return null;
  } catch (error) {
    console.error("ユーザー検索エラー:", error);
    return null;
  }
}
