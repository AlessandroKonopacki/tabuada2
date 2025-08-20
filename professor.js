// Importa Firebase da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, updateDoc, collection, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBQTPYvm4yrUUUZz8-KyeGILEyF6vIma8",
  authDomain: "jogo-da-tabuada-cf924.firebaseapp.com",
  projectId: "jogo-da-tabuada-cf924",
  storageBucket: "jogo-da-tabuada-cf924.appspot.com",
  messagingSenderId: "884835175381",
  appId: "1:884835175381:web:9ca1ae363087cb27624b5c",
  measurementId: "G-GJJSQS3736"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Senha do professor (Você pode mudar esta senha!)
const SENHA_PROFESSOR = "123456";

// Função para fazer login
function login() {
  const senhaDigitada = document.getElementById("senhaProf").value;
  if (senhaDigitada === SENHA_PROFESSOR) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("painelProfessor").classList.remove("hidden");
    carregarAlunos(); // Só carrega a lista após o login
  } else {
    alert("Senha incorreta!");
  }
}

// Carregar lista em tempo real
function carregarAlunos() {
  const alunosRef = collection(db, "alunos");
  onSnapshot(alunosRef, (snapshot) => {
    const lista = document.getElementById("listaAlunos");
    lista.innerHTML = "";

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${docSnap.id}</strong> - Progresso: ${data.progresso} | Coins: ${data.coins}
        <button onclick="liberarCoins('${docSnap.id}')">🔓 Liberar (10 coins)</button>
        <button onclick="resetarAluno('${docSnap.id}')">♻️ Resetar</button>
        <button onclick="excluirAluno('${docSnap.id}')" class="btn-excluir">🗑️ Excluir</button>
      `;

      lista.appendChild(li);
    });
  });
}

// Função para liberar coins
async function liberarCoins(nome) {
  const ref = doc(db, "alunos", nome);
  await updateDoc(ref, { coins: 10 });
}

// Função para resetar aluno
async function resetarAluno(nome) {
  const ref = doc(db, "alunos", nome);
  await updateDoc(ref, { progresso: 0, coins: 10 });
}

// Função para EXCLUIR aluno (NOVA FUNÇÃO)
async function excluirAluno(nome) {
  if (confirm(`Tem certeza que deseja excluir o aluno ${nome}?`)) {
    const ref = doc(db, "alunos", nome);
    await deleteDoc(ref);
    alert(`Aluno ${nome} excluído com sucesso!`);
  }
}

// Expõe funções ao HTML para que os botões funcionem
window.login = login;
window.liberarCoins = liberarCoins;
window.resetarAluno = resetarAluno;
window.excluirAluno = excluirAluno;