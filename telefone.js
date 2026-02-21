import { auth, db } from "./firebase.js";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const nome = document.getElementById("nome");
const idade = document.getElementById("idade");
const cpf = document.getElementById("cpf");
const telefone = document.getElementById("telefone");
const codigo = document.getElementById("codigo");
const msg = document.getElementById("msg");

const btnEnviarCodigo = document.getElementById("btnEnviarCodigo");
const btnConfirmarCodigo = document.getElementById("btnConfirmarCodigo");

let confirmationResult;

// 🔐 reCAPTCHA obrigatório do Firebase
window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  size: "normal"
});


// 📲 ENVIAR SMS
btnEnviarCodigo.onclick = async () => {

  msg.innerText = "";

  if (!telefone.value.startsWith("+55")) {
    msg.innerText = "Use formato +55DDDNUMERO";
    return;
  }

  try {

    confirmationResult = await signInWithPhoneNumber(
      auth,
      telefone.value,
      window.recaptchaVerifier
    );

    msg.innerText = "Código enviado por SMS ✅";

  } catch (error) {
    msg.innerText = error.message;
  }

};


// 🔐 CONFIRMAR CÓDIGO E CRIAR USUÁRIO
btnConfirmarCodigo.onclick = async () => {

  if (!confirmationResult) {
    msg.innerText = "Envie o código primeiro.";
    return;
  }

  try {

    const result = await confirmationResult.confirm(codigo.value);

    const user = result.user;

    // 🔎 Verifica se já existe no Firestore
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {

      // 🔐 Validações básicas
      if (!nome.value.trim()) {
        msg.innerText = "Digite seu nome.";
        return;
      }

      if (parseInt(idade.value) < 18) {
        msg.innerText = "Você precisa ter 18 anos.";
        return;
      }

      if (!/^\d{11}$/.test(cpf.value)) {
        msg.innerText = "CPF inválido.";
        return;
      }

      // 🔐 Salva no Firestore
      await setDoc(docRef, {
        nome: nome.value.trim(),
        idade: parseInt(idade.value),
        cpfHash: btoa(cpf.value), // Nunca salvar CPF puro
        telefone: telefone.value,
        role: "user",
        criadoEm: serverTimestamp()
      });

    }

    msg.innerText = "Conta criada / Login feito com sucesso ✅";
    window.location.href = "Home.html";

  } catch (error) {
    msg.innerText = "Código inválido.";
  }

};
