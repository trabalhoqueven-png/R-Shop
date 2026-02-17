import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ELEMENTOS
const modal = document.getElementById("modalLogin");
const areaUsuario = document.getElementById("areaUsuario");

const nome = document.getElementById("nome");
const idade = document.getElementById("idade");
const cpf = document.getElementById("cpf");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const msg = document.getElementById("msg");

// ABRIR MODAL
document.addEventListener("click", (e) => {
  if (e.target.id === "btnEntrar") {
    modal.style.display = "flex";
    document.body.classList.add("modal-aberto");
  }
});

// 🔒 FECHAR MODAL CLICANDO FORA
modal.addEventListener("click", (e) => {

  // Se clicar no fundo escuro (e não na caixa)
  if (e.target === modal) {
    modal.style.display = "none";
    document.body.classList.remove("modal-aberto");
  }

});

// 🔒 BLOQUEAR LETRAS NO CPF
cpf.addEventListener("input", () => {

  // Remove tudo que não for número
  cpf.value = cpf.value.replace(/\D/g, "");

  // Limita a 11 números
  if (cpf.value.length > 11) {
    cpf.value = cpf.value.slice(0, 11);
  }

});


// LOGIN
btnLogin.onclick = async () => {
  try {

    const cred = await signInWithEmailAndPassword(
      auth,
      email.value,
      senha.value
    );

    // 🔒 SE NÃO VERIFICOU EMAIL
    if (!cred.user.emailVerified) {

      msg.innerText = "Verifique seu email antes de entrar!";
      await signOut(auth);
      return;

    }

    modal.style.display = "none";
    document.body.classList.remove("modal-aberto");
    msg.innerText = "";

  } catch {
    msg.innerText = "❌ Email ou senha inválidos";
  }
};


// CADASTRO
btnCadastro.onclick = async () => {

  if (!nome.value || !idade.value || !cpf.value) {
    msg.innerText = "Preencha todos os campos";
    return;
  }

  if (cpf.value.length !== 11) {
    msg.innerText = "CPF deve ter 11 números";
    return;
  }

  const idadeNumero = parseInt(idade.value);

  if (idadeNumero < 18 || idadeNumero > 100) {
    msg.innerText = "Cadastro permitido apenas para maiores de 18 anos";
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
    idade: idadeNumero,
    cpf: cpf.value,
    email: email.value,
    role: "user",
    criadoEm: serverTimestamp()
});

    modal.style.display = "none";
    document.body.classList.remove("modal-aberto");
    msg.innerText = "";

  } catch (error) {
  console.log(error);
  msg.innerText = error.message;
}
 

};


// 🔞 SOMENTE MAIORES DE 18
idade.addEventListener("input", () => {

  idade.value = idade.value.replace(/\D/g, "");

  let valor = parseInt(idade.value);

  if (valor > 100) {
    idade.value = 100;
  }

});


// 🔥 MOSTRAR NOME + EMAIL NO HEADER
onAuthStateChanged(auth, async (user) => {

  if (user) {

    // 🔥 FORÇA ATUALIZAÇÃO DO STATUS DO EMAIL
    await user.reload();

    if (!user.emailVerified) {
      await signOut(auth);
      alert("Verifique seu email antes de acessar.");
      return;
    }

    const docSnap = await getDoc(doc(db, "usuarios", user.uid));

    if (!docSnap.exists()) {
      console.log("Documento do usuário não encontrado");
      return;
    }

    const dados = docSnap.data();

    let nomeCompleto = dados.nome;

    areaUsuario.innerHTML = `
      <div class="usuario-box">
        <div class="usuario-info">
          <strong>${nomeCompleto}</strong>
          <small>${user.email}</small>
        </div>
        <button id="sair">Sair</button>
      </div>
    `;

    document.getElementById("sair").onclick = () => signOut(auth);

  } else {

    areaUsuario.innerHTML = `<button id="btnEntrar">Entrar</button>`;

  }

});




