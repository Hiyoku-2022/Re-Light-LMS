import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * メールアドレスでユーザーを検索し、ユーザーデータを取得する関数。
 * @param email ユーザーのメールアドレス
 * @returns ユーザーのデータ（見つからなければ null を返す）
 */
export async function getUserByEmail(email: string) {
  try {
    // `users` コレクションと `companies` コレクションをそれぞれ参照
    const usersCollection = collection(db, "users");
    const companiesCollection = collection(db, "companies");

    // `email` フィールドが一致するドキュメントを `users` と `companies` で検索
    const userQuery = query(usersCollection, where("email", "==", email));
    const companyQuery = query(companiesCollection, where("email", "==", email));

    // Firestore から検索結果を取得
    const [userSnapshot, companySnapshot] = await Promise.all([
      getDocs(userQuery),
      getDocs(companyQuery),
    ]);

    // `users` コレクションに一致するユーザーが存在する場合、そのデータを返す
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      return { ...userDoc.data(), collection: "users" }; // データにどのコレクションかの情報を付加
    }

    // `companies` コレクションに一致するユーザーが存在する場合、そのデータを返す
    if (!companySnapshot.empty) {
      const companyDoc = companySnapshot.docs[0];
      return { ...companyDoc.data(), collection: "companies" }; // データにどのコレクションかの情報を付加
    }

    return null; // どちらのコレクションにも一致するユーザーがいない場合は null を返す
  } catch (error) {
    console.error("ユーザー検索エラー:", error);
    return null;
  }
}
