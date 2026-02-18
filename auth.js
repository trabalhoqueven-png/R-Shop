import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ELEMENTOS
const userNome = document.getElementById("userNome");
const userEmail = document.getElementById("userEmail");
const btnSair = document.getElementById("btnSair");

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const msg = document.getElementById("msg");
const modal = document.getElementById("modalLogin");

const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");

let usuarioLogado = false;
let usuarioRole = null;


// 🔐 CONTROLE GLOBAL DE LOGIN
window.addEventListener("DOMContentLoaded", () => {

  onAuthStateChanged(auth, async (user) => {

    if (!user && window.location.pathname.includes("Home.html")) {
      window.location.href = "index.html";
      return;
    }

    if (user) {

      console.log("Usuário logado:", user.uid);

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      console.log("Documento Firestore:", docSnap.data());

      if (docSnap.exists()) {

        if (userNome) userNome.innerText = docSnap.data().nome;
        if (userEmail) userEmail.innerText = user.email;

      } else {
        console.log("Documento não encontrado");
      }

    }

  });

});



// 🔒 Atualiza bloqueio de links
function atualizarLinks() {

  const links = document.querySelectorAll(".card a");

  links.forEach(link => {

    if (!usuarioLogado) {
      link.style.pointerEvents = "none";
      link.style.opacity = "0.5";
    } else {
      link.style.pointerEvents = "auto";
      link.style.opacity = "1";
    }

  });

}


// 🚪 SAIR
if (btnSair) {
  btnSair.onclick = async () => {
    await signOut(auth);
    window.location.href = "index.html";
  };
}


// 🔓 ABRIR MODAL LOGIN
document.addEventListener("click", (e) => {
  if (e.target.id === "btnEntrar" && modal) {
    modal.style.display = "flex";
  }
});


// 🔒 BLOQUEAR COMPRA SE NÃO LOGADO
document.addEventListener("click", (e) => {

  const link = e.target.closest(".card a");

  if (link && !usuarioLogado) {

    e.preventDefault();

    if (modal) modal.style.display = "flex";
    if (msg) msg.innerText = "Faça login para comprar.";

  }

});


// 🔵 LOGIN
if (btnLogin) {

  btnLogin.onclick = async () => {

    try {

      const cred = await signInWithEmailAndPassword(
        auth,
        email.value,
        senha.value
      );

      if (!cred.user.emailVerified) {
        msg.innerText = "Verifique seu email antes de entrar!";
        return;
      }

      window.location.replace("Home.html");

    } catch {
      msg.innerText = "Email ou senha inválidos";
    }

  };

}


// 🟢 CADASTRO
if (btnCadastro) {

  const nome = document.getElementById("nome");
  const idade = document.getElementById("idade");
  const cpf = document.getElementById("cpf");

  btnCadastro.onclick = async () => {

    if (!nome.value || !idade.value || !cpf.value) {
      msg.innerText = "Preencha todos os campos";
      return;
    }

    if (cpf.value.length !== 11) {
      msg.innerText = "CPF deve ter 11 números";
      return;
    }

    try {

      const cred = await createUserWithEmailAndPassword(
        auth,
        email.value,
        senha.value
      );

      await sendEmailVerification(cred.user);

      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nome: nome.value,
        idade: parseInt(idade.value),
        cpf: cpf.value,
        email: email.value,
        role: "user", // 🔥 aqui define padrão como user
        criadoEm: serverTimestamp()
      });

      alert("Conta criada! Verifique seu email.");
      window.location.href = "index.html";

    } catch (error) {
      msg.innerText = error.message;
    }

  };

}


// 🚀 PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("PWA pronta 🔥"))
    .catch(err => console.log(err));
}
