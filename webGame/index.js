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

let account = false;
let loggedInUser;
let userID;
let characterUser;
let position = {};
window.popUp = false;
const startGame = document.querySelector(".startGame");
const canvas = document.querySelector(".canvas");
const roomCanvas = document.querySelector(".roomCanvas");
let coins = 0;
let skin = [];
let skinPrice = 0;
let chosenSkin;

const start = document.querySelector(".startButton");
let lastPositionX;

function randomize() {
  let x = Math.floor(Math.random() * 16) * 16;
  let y = Math.floor(Math.random() * 9) * 16;

  position = {
    x,
    y,
  };

  lastPositionX = position.x;
}

let nonPremium = ["red", "blue", "green", "white"];
let chosenChar;

function selectCharacter() {
  let randNum = Math.floor(Math.random() * 3);

  chosenChar = nonPremium[randNum];
}

const anonArray = [
  "James<i>(Anon)</i>",
  "Daniel<i>(Anon)</i>",
  "Donny<i>(Anon)</i>",
  "Alden<i>(Anon)</i>",
  "Dingdong<i>(Anon)</i>",
];

function nameChooser() {
  let index = Math.floor(Math.random() * 5);

  return anonArray[index];
}

const emailRegex = new RegExp("[a-z0-9]+@[a-z]+\\.[a-z]{2,3}");
const usernameRegex = new RegExp("[a-zA-z0-9_]{6}");
const passwordRegex = new RegExp("[a-zA-z0-9_]{8}");
let userOK, emailOK, passwordOK;

userOK = emailOK = passwordOK = false;

function validate() {
  console.log(userOK);
  console.log(emailOK);
  console.log(passwordOK);

  if (userOK == true && emailOK == true && passwordOK == true) {
    document.querySelector(".signupSubmit").removeAttribute("disabled");
  } else {
    document.querySelector(".signupSubmit").setAttribute("disabled", "true");
  }
}

onSnapshot(collection(db, "accounts"), (skins) => {
  skins.forEach((skin) => {
    if (skin.id == userID) {
      chosenSkin = skin.data().chosenSkin;
    }
  });
});

onSnapshot(collection(db, "players"), (players) => {
  players.docChanges().forEach((player) => {
    if (player.type == "added") {
      let character = document.createElement("div");
      character.classList.add(player.doc.data().color);
      character.innerHTML = `<div class="nameTag">${
        player.doc.data().name
      }</div>`;
      character.style.position = "absolute";
      character.style.marginTop = `${player.doc.data().y}px`;
      character.style.marginLeft = `${player.doc.data().x}px`;
      character.classList.add(`div-${player.doc.id}`);
      character.classList.add(`player`);
      canvas.appendChild(character);
    } else if (player.type == "modified") {
      let direction = position.x - lastPositionX;
      lastPositionX = position.x;

      if (direction == -16) {
        if (chosenSkin == "hero") {
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.add("charLeftTwo");
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.remove("charRightTwo");
        } else {
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.add("charLeft");
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.remove("charRight");
        }
      } else if (direction == 16) {
        if (chosenSkin == "hero") {
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.remove("charLeftTwo");
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.add("charRightTwo");
        } else {
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.remove("charLeft");
          document
            .querySelector(`.div-${player.doc.id}`)
            .classList.add("charRight");
        }
      }

      let other = document.querySelector(`.div-${player.doc.id}`);
      other.style.marginTop = `${player.doc.data().y}px`;
      other.style.marginLeft = `${player.doc.data().x}px`;
    } else if (player.type == "removed") {
      let other = document.querySelector(`.div-${player.doc.id}`);
      other.parentNode.removeChild(other);
    }
  });
});

start.addEventListener("click", () => {
  signInAnonymously(auth).then((user) => {
    userID = user.user.uid;
    loggedInUser = auth.currentUser;

    startGame.classList.add("hide");
    roomCanvas.classList.remove("hide");

    randomize();

    selectCharacter();

    setDoc(doc(db, "players", `${user.user.uid}`), {
      color: chosenChar,
      name: `${nameChooser()}`,
      playerID: user.user.uid,
      x: position.x,
      y: position.y,
    });

    document.querySelectorAll(".chatChat").forEach((chat) => {
      chat.parentNode.removeChild(chat);
    });

    getDocs(
      query(collection(db, "messages"), orderBy("createdAt", "asc"))
    ).then((messages) => {
      messages.docChanges().forEach((message) => {
        if (message.type == "added") {
          if (message.doc.data().recipient == userID) {
            document.querySelector(
              ".chatContainer"
            ).innerHTML += `<div class="chatChat right id-${
              message.doc.id
            }"><div class="message" style="background: #37946e;">${
              message.doc.data().message
            }</div><p class="from">${message.doc.data().recipient}</p></div>`;

            document.querySelector(`.id-${message.doc.id}`).scrollIntoView();
          } else {
            document.querySelector(
              ".chatContainer"
            ).innerHTML += `<div class="chatChat left id-${
              message.doc.id
            }"><div class="message" style="background: #304c40;">${
              message.doc.data().message
            }</div><p class="from">${message.doc.data().recipient}</p></div>`;

            document.querySelector(`.id-${message.doc.id}`).scrollIntoView();
          }
        }
      });
    });

    userOK = emailOK = passwordOK = false;
    document.querySelector(".logout").classList.remove("hide");
    document.querySelector(".chatLogo").classList.remove("hide");
    document.querySelector(".chatSection").classList.remove("hide");
    characterUser = document.querySelector(`.div-${user.user.uid}`);
  });
});

function close() {
  document.querySelector(".movieResponse").src = "";
  document.querySelector(".movieInfo").innerHTML = "";

  document.querySelector(".tvPopup").style.top = "150%";
  document.querySelector(".signupPopup").style.top = "150%";
  document.querySelector(".loginPopup").style.top = "150%";
  document.querySelector(".coinsPopup").style.top = "150%";
  document.querySelector(".shopPopup").style.top = "150%";
  document.querySelector(".ownedPopup").style.top = "150%";

  setTimeout(() => {
    document.querySelector(".tvPopup").classList.add("hide");
    document.querySelector(".signupPopup").classList.add("hide");
    document.querySelector(".loginPopup").classList.add("hide");
    document.querySelector(".coinsPopup").classList.add("hide");
    document.querySelector(".shopPopup").classList.add("hide");
    document.querySelector(".ownedPopup").classList.add("hide");
  }, 200);
  window.popUp = false;
}

document.querySelector(".signupForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const signupEmail = document.querySelector(".signupForm").email.value;
  const signupUsername = document.querySelector(".signupForm").username.value;
  const signupPassword = document.querySelector(".signupForm").password.value;
  document.querySelector(".signupForm").reset();

  console.log(signupEmail);

  createUserWithEmailAndPassword(auth, signupEmail, signupPassword).then(
    (user) => {
      setDoc(doc(db, "accounts", `${user.user.uid}`), {
        skins: "none",
        chosenSkin: "none",
        coins: 0,
        premium: false,
        name: signupUsername,
        playerID: user.user.uid,
        email: signupEmail,
        password: signupPassword,
      });
    }
  );

  userOK = emailOK = passwordOK = false;
  validate();
  close();
});

document.querySelector(".signupEmail").addEventListener("input", () => {
  if (emailRegex.test(document.querySelector(".signupEmail").value)) {
    document.querySelector(".signupEmail").style.border = "2px solid green";
    emailOK = true;
  } else {
    document.querySelector(".signupEmail").style.border = "2px solid red";
    emailOK = false;
  }
  validate();
});

document.querySelector(".signupUsername").addEventListener("input", () => {
  if (usernameRegex.test(document.querySelector(".signupUsername").value)) {
    document.querySelector(".signupUsername").style.border = "2px solid green";
    userOK = true;
  } else {
    document.querySelector(".signupUsername").style.border = "2px solid red";
    userOK = false;
  }
  validate();
});

document.querySelector(".signupPassword").addEventListener("input", () => {
  if (passwordRegex.test(document.querySelector(".signupPassword").value)) {
    document.querySelector(".signupPassword").style.border = "2px solid green";
    passwordOK = true;
  } else {
    document.querySelector(".signupPassword").style.border = "2px solid red";
    passwordOK = false;
  }
  validate();
});

function incorrect() {
  let popup = document.querySelector(".loginPopup");

  popup.style.left = "51%";
  popup.style.top = "52%";
  setTimeout(() => {
    popup.style.left = "51%";
    popup.style.top = "50%";
  }, 50);
  setTimeout(() => {
    popup.style.left = "50%";
    popup.style.top = "50%";
  }, 100);
}

document.querySelector(".loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const loginEmail = document.querySelector(".loginForm").email.value;
  const loginPassword = document.querySelector(".loginForm").password.value;

  document.querySelector(".loginForm").reset();

  signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    .then((user) => {
      userID = user.user.uid;
      loggedInUser = auth.currentUser;
      document.querySelector(".ownedSkins").innerHTML = "";
      skin = [];

      getDoc(doc(db, "accounts", userID)).then((data) => {
        let name = data.data().name;
        let premium = data.data().premium;
        coins = data.data().coins;
        console.log(data.data().skins);

        document.querySelector(".coinCount").innerHTML = coins;
        document.querySelector(".coins").classList.remove("hide");

        startGame.classList.add("hide");
        roomCanvas.classList.remove("hide");

        randomize();
        selectCharacter();

        if (premium == false) {
          setDoc(doc(db, "players", `${user.user.uid}`), {
            color: chosenChar,
            name,
            playerID: user.user.uid,
            x: position.x,
            y: position.y,
          });
        } else if (premium == true) {
          getDoc(doc(db, "accounts", user.user.uid)).then((data) => {
            chosenSkin = data.data().chosenSkin;
            skin = data.data().skins;
            if (chosenSkin == "none") {
              chosenSkin = chosenChar;
            }
            console.log(chosenSkin);

            skin.forEach((skinData) => {
              console.log(skinData);
              document.querySelector(
                ".ownedSkins"
              ).innerHTML += `<div class="ownedContainer"><div class="skinModel"><img class="skinImage" src="./premiumSkins/${skinData.file}"/></div><button class="equip" onclick="equip('${skinData.name}')">Equip</button></div>`;
            });

            setDoc(doc(db, "players", `${user.user.uid}`), {
              color: chosenSkin,
              name,
              playerID: user.user.uid,
              x: position.x,
              y: position.y,
            });
          });
        }
      });

      document.querySelectorAll(".chatChat").forEach((chat) => {
        chat.parentNode.removeChild(chat);
      });

      getDocs(
        query(collection(db, "messages"), orderBy("createdAt", "asc"))
      ).then((messages) => {
        messages.docChanges().forEach((message) => {
          if (message.type == "added") {
            if (message.doc.data().recipient == userID) {
              document.querySelector(
                ".chatContainer"
              ).innerHTML += `<div class="chatChat right id-${
                message.doc.id
              }"><div class="message" style="background: #37946e;">${
                message.doc.data().message
              }</div><p class="from">${message.doc.data().recipient}</p></div>`;

              document.querySelector(`.id-${message.doc.id}`).scrollIntoView();
            } else {
              document.querySelector(
                ".chatContainer"
              ).innerHTML += `<div class="chatChat left id-${
                message.doc.id
              }"><div class="message" style="background: #304c40;">${
                message.doc.data().message
              }</div><p class="from">${message.doc.data().recipient}</p></div>`;

              document.querySelector(`.id-${message.doc.id}`).scrollIntoView();
            }
          }
        });
      });

      account = true;
      userOK = emailOK = passwordOK = false;
      validate();
      document.querySelector(".logout").classList.remove("hide");
      document.querySelector(".chatLogo").classList.remove("hide");
      document.querySelector(".chatSection").classList.remove("hide");
      document.querySelector(".shop").classList.remove("hide");
      document.querySelector(".owned").classList.remove("hide");
      characterUser = document.querySelector(`.div-${user.user.uid}`);

      console.log(skin);

      close();
    })
    .catch((err) => {
      incorrect();
    });
});

document.addEventListener("keydown", function (event) {
  if (window.popUp == false) {
    switch (event.key) {
      case "w":
        if (
          position.y != 0 &&
          (position.x > 32 || position.y > 112 || position.y < 112) &&
          (position.y > 112 ||
            position.y < 64 ||
            position.x < 112 ||
            position.x > 144) &&
          (position.y > 16 || position.x < 96 || position.x > 128) &&
          (position.y > 16 || position.x > 0) &&
          (position.y > 16 || position.x > 64 || position.x < 64) &&
          (position.y > 48 || position.y < 16 || position.x > 0) &&
          (position.y > 48 ||
            position.y < 16 ||
            position.x > 64 ||
            position.x < 64)
        ) {
          position.y -= 16;

          console.log(position.y);
          updateDoc(doc(db, "players", `${userID}`), {
            y: position.y,
          });
        }
        break;
      case "a":
        if (
          position.x != 0 &&
          (position.x > 48 || position.y != 96) &&
          (position.x < 112 ||
            position.x > 160 ||
            position.y > 96 ||
            position.y < 64) &&
          (position.x > 48 || position.y < 128) &&
          (position.x > 16 || position.y > 0) &&
          (position.x > 80 || position.x < 64 || position.y > 0) &&
          (position.x > 144 || position.x < 80 || position.y > 0) &&
          (position.x > 208 || position.x < 144 || position.y > 0) &&
          (position.x > 16 || position.y > 32 || position.y < 32) &&
          (position.x > 80 ||
            position.x < 64 ||
            position.y > 32 ||
            position.y < 32)
        ) {
          position.x -= 16;

          console.log(position.x);

          updateDoc(doc(db, "players", `${userID}`), {
            x: position.x,
          });
        }
        break;
      case "s":
        if (
          position.y < 144 - 16 &&
          (position.x > 32 || position.y > 80 || position.y < 80) &&
          (position.y < 48 ||
            position.y > 96 ||
            position.x < 112 ||
            position.x > 144) &&
          (position.y < 112 || position.x > 32) &&
          (position.y > 16 || position.y < 16 || position.x > 0) &&
          (position.y > 16 ||
            position.y < 16 ||
            position.x > 64 ||
            position.x < 64)
        ) {
          position.y += 16;
          console.log(position.y);

          updateDoc(doc(db, "players", `${userID}`), {
            y: position.y,
          });
        }
        break;
      case "d":
        if (
          position.x < 256 - 16 &&
          (position.x < 96 ||
            position.x > 144 ||
            position.y > 96 ||
            position.y < 64) &&
          (position.x > 80 || position.x < 48 || position.y > 0) &&
          (position.x > 144 || position.x < 144 || position.y > 0) &&
          (position.x > 48 ||
            position.x < 48 ||
            position.y > 32 ||
            position.y < 32)
        ) {
          position.x += 16;

          console.log(position.x);

          updateDoc(doc(db, "players", `${userID}`), {
            x: position.x,
          });
        }
        break;
    }
  }

  if (userID != undefined && window.popUp == false) {
    if (event.key == "/") {
      document.querySelector(".chatSection").style.left = 0;
      window.popUp = true;
    }
  }
});

const chat = document.querySelector(".chatBar");

chat.addEventListener("submit", (e) => {
  e.preventDefault();

  const message = chat.chatInput.value;
  chat.reset();

  addDoc(collection(db, "messages"), {
    createdAt: serverTimestamp(),
    recipient: userID,
    message: message,
  });
});

document.querySelector(".logout").addEventListener("click", () => {
  document.querySelector(".logout").classList.add("hide");
  startGame.classList.remove("hide");
  roomCanvas.classList.add("hide");

  document.querySelector(".chatSection").classList.add("hide");
  document.querySelector(".chatLogo").classList.add("hide");
  document.querySelector(".coins").classList.add("hide");
  document.querySelector(".owned").classList.add("hide");
  document.querySelector(".shop").classList.add("hide");

  // document.querySelectorAll(".chatChat").forEach((chat) => {
  //   chat.parentNode.removeChild(chat);
  // });

  if (account == false) {
    deleteUser(loggedInUser);
  }
  deleteDoc(doc(db, "players", `${userID}`));
  userID = undefined;
  account = false;
  document.querySelector(".chatSection").style.left = "-500px";
  window.popUp = false;
});

onSnapshot(
  query(collection(db, "messages"), orderBy("createdAt", "asc")),
  (messages) => {
    messages.docChanges().forEach((message) => {
      if (message.type == "added") {
        if (message.doc.data().recipient == userID) {
          document.querySelector(
            ".chatContainer"
          ).innerHTML += `<div class="chatChat right id-${
            message.doc.id
          }"><div class="message" style="background: #37946e;">${
            message.doc.data().message
          }</div><p class="from">${message.doc.data().recipient}</p></div>`;

          document.querySelector(`.id-${message.doc.id}`).scrollIntoView();
        } else {
          document.querySelector(
            ".chatContainer"
          ).innerHTML += `<div class="chatChat left id-${
            message.doc.id
          }"><div class="message" style="background: #304c40;">${
            message.doc.data().message
          }</div><p class="from">${message.doc.data().recipient}</p></div>`;

          document.querySelector(`.id-${message.doc.id}`).scrollIntoView();
        }
      }
    });
  }
);

let coinsToBuy = 0;

document.querySelector(".yes").addEventListener("click", () => {
  let diff = coins - skinPrice;
  console.log(skin);

  console.log(diff);
  if (diff < 0) {
    alert("not enough coins");
  } else {
    updateDoc(doc(db, "accounts", userID), {
      premium: true,
      coins: diff + coinsToBuy,
      skins: skin,
    }).then(() => {
      console.log("Item purchased");
    });

    addDoc(collection(db, "transactions"), {
      item: `${skinToBuy}, ${coinsToBuy}`,
      createdAt: serverTimestamp(),
    });
  }

  coinsToBuy = 0;
  skinPrice = 0;
  skin.pop(skinToBuy);
  skinToBuy = "";
  document.querySelector(".confirmPurchase").classList.add("hide");
});

document.querySelector(".no").addEventListener("click", () => {
  coinsToBuy = 0;
  skinPrice = 0;
  skin.pop(skinToBuy);
  skinToBuy = "";
  document.querySelector(".confirmPurchase").classList.add("hide");
});

onSnapshot(
  query(collection(db, "coins"), orderBy("coins", "desc")),
  (shops) => {
    shops.forEach((shop) => {
      let coins = document.createElement("div");
      coins.classList.add(`itemID-${shop.id}`);
      coins.classList.add(`topUps`);
      coins.innerHTML = `<h3 class="value">${
        shop.data().coins
      } coins</h3><p class="coinPrice">Php ${shop.data().price}.00</p>`;
      coins.addEventListener("click", () => {
        coinsToBuy = shop.data().coins;
        document.querySelector(
          ".prompt"
        ).innerHTML = `Buy ${coinsToBuy} coins for Php ${
          shop.data().price
        }.00?`;
        document.querySelector(".confirmPurchase").classList.remove("hide");
      });
      document.querySelector(".coinsShop").append(coins);
    });
  }
);

onSnapshot(collection(db, "accounts"), (datas) => {
  datas.docChanges().forEach((data) => {
    if (data.doc.id == userID) {
      document.querySelector(".ownedSkins").innerHTML = "";

      if (data.type == "added") {
        console.log(data.doc.data().skins);
        coins = data.doc.data().coins;
        document.querySelector(".coinCount").innerHTML = coins;
      } else if (data.type == "modified") {
        coins = data.doc.data().coins;
        console.log(coins);
        document.querySelector(".coinCount").innerHTML = coins;

        skin = data.doc.data().skins;
        console.log(skin);

        skin.forEach((skinData) => {
          console.log(skinData);
          document.querySelector(
            ".ownedSkins"
          ).innerHTML += `<div class="ownedContainer"><div class="skinModel"><img class="skinImage" src="./premiumSkins/${skinData.file}"/></div><button class="equip" onclick="equip('${skinData.name}')">Equip</button></div>`;
        });
      }
    }
  });
});

{
  /* <div class="skinModel" style="background-image: url('./premiumSkins/${
      skindata.data().file
    }'); background-repeat: no-repeat; background-size: contain; image-rendering: pixelated; background-position: center;" ></div> */
}

let skinToBuy;

onSnapshot(collection(db, "skins"), (skins) => {
  skins.forEach((skindata) => {
    let skinPrem = document.createElement("div");
    skinPrem.classList.add(`itemID-${skindata.id}`);
    skinPrem.classList.add(`buySkin`);
    skinPrem.innerHTML = `<div class="skinModel"><img class="skinImage" src="./premiumSkins/${
      skindata.data().file
    }"/></div><p class="skinPrice">${skindata.data().price} coins</p>`;
    skinPrem.addEventListener("click", () => {
      skinToBuy = {
        name: skindata.data().name,
        file: skindata.data().file,
      };
      skinPrice = skindata.data().price;

      skin.push(skinToBuy);
      document.querySelector(".prompt").innerHTML = `Buy ${
        skindata.data().name
      } for ${skindata.data().price} coins?`;
      document.querySelector(".confirmPurchase").classList.remove("hide");
    });
    // coins.addEventListener("click", () => {
    //   coinsToBuy = shop.data().coins;
    //   document.querySelector(
    //     ".prompt"
    //   ).innerHTML = `Buy ${coinsToBuy} coins for Php ${
    //     shop.data().price
    //   }.00?`;
    //   document.querySelector(".confirmPurchase").classList.remove("hide");
    // });
    document.querySelector(".skinShop").append(skinPrem);
  });
});

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  document.querySelector(".logout").classList.add("hide");
  startGame.classList.remove("hide");
  roomCanvas.classList.add("hide");

  document.querySelector(".chatSection").classList.add("hide");
  document.querySelector(".chatLogo").classList.add("hide");
  document.querySelector(".coins").classList.add("hide");
  document.querySelector(".owned").classList.add("hide");
  document.querySelector(".shop").classList.add("hide");

  // document.querySelectorAll(".chatChat").forEach((chat) => {
  //   chat.parentNode.removeChild(chat);
  // });

  if (account == false) {
    deleteUser(loggedInUser);
  }
  deleteDoc(doc(db, "players", `${userID}`));
  userID = undefined;
  account = false;
});

document.querySelector(".yesEquip").addEventListener("click", () => {
  document.querySelector(`.div-${userID}`).classList.remove(chosenSkin);
  console.log(chosenSkin);
  chosenSkin = window.equipped;

  updateDoc(doc(db, "accounts", userID), {
    chosenSkin: window.equipped,
  });

  updateDoc(doc(db, "players", userID), {
    color: window.equipped,
  }).then(() => {
    document.querySelector(".promptEquip").innerHTML = "";
    document.querySelector(".confirmEquip").classList.add("hide");
    document
      .querySelector(`.div-${userID}`)
      .classList.add(`${window.equipped}`);
    window.equipped = "";
  });
});

document.querySelector(".noEquip").addEventListener("click", () => {
  document.querySelector(".promptEquip").innerHTML = "";
  window.equipped = "";
  document.querySelector(".confirmEquip").classList.add("hide");
});
