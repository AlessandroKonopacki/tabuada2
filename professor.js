// Importa Firebase da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
      `;

      lista.appendChild(li);
    });
  });
}

// Função para liberar coins
async function liberarCoins(nome) {
  const ref = doc(db, "alunos", nome);
  await updateDoc(ref, { coins: 10 });
  alert(`✅ Aluno ${nome} recebeu 10 coins!`);
}

// Função para resetar aluno
async function resetarAluno(nome) {
  const ref = doc(db, "alunos", nome);
  await updateDoc(ref, { coins: 5, progresso: 0 });
  alert(`♻️ Aluno ${nome} foi resetado!`);
}

// Inicializa
carregarAlunos();

// Expor funções para HTML
window.liberarCoins = liberarCoins;
window.resetarAluno = resetarAluno;
