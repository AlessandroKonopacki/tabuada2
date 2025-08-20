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

// ===================== EVENTOS DE TECLA (NOVO) =====================
// Permite entrar no jogo com a tecla Enter
document.getElementById("nomeAluno").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        entrarJogo();
    }
});

// Permite enviar a resposta com a tecla Enter
document.getElementById("resposta").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        verificarResposta();
    }
});

// ===================== FUNÇÕES DO JOGO =====================

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

  const ref = doc(db, "alunos", aluno);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const dadosAluno = snap.data();
    progresso = dadosAluno.progresso;
    coins = dadosAluno.coins;

    if (coins <= 0) {
      await updateDoc(ref, { coins: 10 });
      coins = 10;
      alert("Bem-vindo de volta! Suas moedas foram restauradas.");
    }
  } else {
    await setDoc(ref, { progresso: 0, coins: 10 });
    progresso = 0;
    coins = 10;
    alert("Novo aluno cadastrado! Bom jogo!");
  }

  atualizarTela();
  carregarRanking();
  novaQuestao();
}

// Gera nova questão de tabuada
async function novaQuestao() {
  if (coins <= 0) {
    alert("⚠️ Você ficou sem moedas! Peça ao professor para liberar.");
    return;
  }

  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  respostaCorreta = a * b;

  document.getElementById("questao").classList.remove("hidden");
  document.getElementById("pergunta").textContent = `Quanto é ${a} x ${b}?`;
  document.getElementById("resposta").focus(); // Coloca o foco no campo de resposta
}

// Verifica resposta
async function verificarResposta() {
  const resposta = parseInt(document.getElementById("resposta").value);
  if (isNaN(resposta)) {
      alert("Por favor, digite um número.");
      return;
  }
  
  if (resposta === respostaCorreta) {
    progresso++;
    coins += 5;
    alert("✅ Correto! Você ganhou 5 coins.");
  } else {
    coins -= 3;
    alert(`❌ Errado! Perdeu 3 coins. Resposta correta: ${respostaCorreta}`);
  }

  if (coins <= 0) {
    coins = 0;
    alert("⚠️ Você ficou sem coins! Peça ao professor para liberar.");
  }

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