// Importa Firebase direto da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
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

let aluno = null;
let progresso = 0;
let coins = 0;
let respostaCorreta = 0;

// Função de login
async function entrarJogo() {
  const nome = document.getElementById("nomeAluno").value.trim();
  if (!nome) {
    alert("Digite seu nome!");
    return;
  }

  aluno = nome;
  document.getElementById("alunoNome").textContent = nome;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("jogo").classList.remove("hidden");

  // Carregar progresso do Firestore
  const ref = doc(db, "alunos", aluno);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    progresso = snap.data().progresso;
    coins = snap.data().coins;
  } else {
    await setDoc(ref, { progresso: 0, coins: 0 });
    progresso = 0;
    coins = 0;
  }

  atualizarTela();
  carregarRanking();
}

// Gera nova questão de tabuada
function novaQuestao() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  respostaCorreta = a * b;

  document.getElementById("questao").classList.remove("hidden");
  document.getElementById("pergunta").textContent = `Quanto é ${a} x ${b}?`;
}

// Verifica resposta
async function verificarResposta() {
  const resposta = parseInt(document.getElementById("resposta").value);

  if (resposta === respostaCorreta) {
    progresso++;
    coins += 5;
    alert("✅ Correto! Você ganhou 5 coins.");
  } else {
    coins -= 3;
    alert(`❌ Errado! Perdeu 3 coins. Resposta correta: ${respostaCorreta}`);
  }

  // Se coins zerar, trava o aluno até o professor liberar
  if (coins <= 0) {
    coins = 0;
    alert("⚠️ Você ficou sem coins! Peça ao professor para liberar.");
  }

  // Atualizar no Firestore
  const ref = doc(db, "alunos", aluno);
  await updateDoc(ref, { progresso, coins });

  atualizarTela();
  document.getElementById("questao").classList.add("hidden");
  document.getElementById("resposta").value = "";
}

// Atualiza tela com dados
function atualizarTela() {
  document.getElementById("progresso").textContent = progresso;
  document.getElementById("coins").textContent = coins;
}

// Ranking em tempo real
function carregarRanking() {
  const alunosRef = collection(db, "alunos");
  onSnapshot(alunosRef, (snapshot) => {
    const lista = document.getElementById("ranking");
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${doc.id} - Progresso: ${data.progresso} | Coins: ${data.coins}`;
      lista.appendChild(li);
    });
  });
}

// Expõe funções ao HTML
window.entrarJogo = entrarJogo;
window.novaQuestao = novaQuestao;
window.verificarResposta = verificarResposta;
