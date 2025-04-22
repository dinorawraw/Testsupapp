import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCLy5LN6XUyylurZVRzzgBsh9oajk2Lj_4",
  authDomain: "supapp-86107.firebaseapp.com",
  databaseURL: "https://supapp-86107-default-rtdb.firebaseio.com",
  projectId: "supapp-86107",
  storageBucket: "supapp-86107.firebasestorage.app",
  messagingSenderId: "134578506306",
  appId: "1:134578506306:web:e02dfdd6a2a5d252287bdb",
  measurementId: "G-KNWTEB2JEJ",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
