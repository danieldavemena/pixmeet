// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8HxiU25fxvZjEUagY3JK3IDj6Ed5vGUw",
  authDomain: "webgame-a0345.firebaseapp.com",
  projectId: "webgame-a0345",
  storageBucket: "webgame-a0345.appspot.com",
  messagingSenderId: "175657023443",
  appId: "1:175657023443:web:a81965cd31fce13971a126",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

document.querySelector(".login").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.querySelector(".login").username.value;
  const password = document.querySelector(".login").password.value;

  getDocs(
    query(
      collection(db, "admin"),
      where("username", "==", username),
      where("password", "==", password)
    )
  )
    .then((admin) => {
      admin.forEach((ad) => {
        sessionStorage.setItem("adminID", ad.id);
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

onSnapshot(collection(db, "players"), (players) => {
  let online = 0;
  const playerCount = document.querySelector(".playerCount");
  playerCount.innerHTML = 0;
  let countOfPlayers = 0;

  players.forEach((player) => {
    online += 1;

    countOfPlayers += Number(1);
    playerCount.innerHTML = countOfPlayers;
  });

  onSnapshot(collection(db, "accounts"), (players) => {
    let online = 0;

    const playerCount = document.querySelector(".accountCount");
    playerCount.innerHTML = 0;
    let countOfPlayers = 0;

    players.docChanges().forEach((player) => {
      online += 1;

      if (player.type == "added") {
        countOfPlayers += Number(1);
        playerCount.innerHTML = countOfPlayers;
      }
    });
  });

  if (online > 0) {
    document.querySelector(".webStatus").innerHTML =
      "<p style='color: green; -webkit-text-stroke: 1px white'>Online<p>";
  } else {
    document.querySelector(".webStatus").innerHTML =
      "<p style='color: red; -webkit-text-stroke: 1px white'>Offline<p>";
  }
});

onSnapshot(collection(db, "players"), (players) => {
  const table = document.querySelector(".listTable");
  table.innerHTML = "";
  table.innerHTML = `<tr>
    <th>ID</th>
    <th>Name</th>
    </tr>`;

  players.forEach((player) => {
    table.innerHTML += `<tr>
    <td>${player.id}</td>
    <td>${player.data().name}</td>
    </tr>`;
  });
});

document.querySelector(".dashboardBtn").addEventListener("click", () => {
  document.querySelector(".dashboard").classList.remove("hide");
  document.querySelector(".serverStatus").style.display = "flex";
  document.querySelector(".users").classList.add("hide");
  document.querySelector(".sales").classList.add("hide");
});

document.querySelector(".usersBtn").addEventListener("click", () => {
  document.querySelector(".users").classList.remove("hide");
  document.querySelector(".dashboard").classList.add("hide");
  document.querySelector(".serverStatus").style.display = "none";
  document.querySelector(".sales").classList.add("hide");
});

document.querySelector(".salesBtn").addEventListener("click", () => {
  document.querySelector(".users").classList.add("hide");
  document.querySelector(".dashboard").classList.add("hide");
  document.querySelector(".serverStatus").style.display = "none";
  document.querySelector(".sales").classList.remove("hide");
});

onSnapshot(collection(db, "transactions"), (snaps) => {
  const table = document.querySelector(".salesTable");
  table.innerHTML = "";
  table.innerHTML = `<tr>
    <th>Items</th>
    <th>Created at</th>
    </tr>`;

  snaps.forEach((snap) => {
    console.log(snap.data());
    table.innerHTML += `<tr>
    <td>${snap.data().item}</td>
    <td>${snap.data().createdAt.toDate()}</td>
    </tr>`;
  });
});
