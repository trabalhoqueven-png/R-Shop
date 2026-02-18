import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const msg = document.getElementById("msg");
const btnSair = document.getElementById("btnSair");
const modal = document.getElementById("modalLogin");

document.addEventListener("click", (e) => {
  if (e.target.id === "btnEntrar") {
    modal.style.display = "flex";
  }
});

// 🚪 SAIR
if (btnSair) {
  btnSair.onclick = async () => {
    await signOut(auth);
    window.location.href = "index.html";
  };
}

// 🔒 PROTEGER HOME
if (window.location.pathname.includes("Home.html")) {

  onAuthStateChanged(auth, (user) => {

    if (!user) {
      window.location.href = "index.html"; // bloqueia acesso
    }

  });

}

// 🔵 LOGIN
const btnLogin = document.getElementById("btnLogin");

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

      window.location.replace("Home.html");// página principal

    } catch {
      msg.innerText = "Email ou senha inválidos";
    }
  };
}

// 🟢 CADASTRO
const btnCadastro = document.getElementById("btnCadastro");

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
        role: "user",
        criadoEm: serverTimestamp()
      });

      alert("Conta criada! Verifique seu email.");
      window.location.href = "index.html";

    } catch (error) {
      msg.innerText = error.message;
    }

  };
}
