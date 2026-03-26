import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCStSb9XXVOCsRuoIha6J-v9qzc8q8xn4Q",
  authDomain: "kaamatkaam.firebaseapp.com",
  projectId: "kaamatkaam",
  storageBucket: "kaamatkaam.firebasestorage.app",
  messagingSenderId: "553980904768",
  appId: "1:553980904768:web:7e78a1681aa436485be6a5",
  measurementId: "G-R8F84EEHJN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };
