// Importa Firebase direto da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
let turma = null;
let progresso = 0;
let coins = 0;
let respostaCorreta = 0;

const tempoPorPacote = 60;
let tempoRestante = tempoPorPacote;
let perguntasRespondidas = 0;
let timerInterval = null;
let alunoDocRef; // Variável para a referência do documento do aluno

// ===================== EVENTOS DE TECLA =====================
document.getElementById("nomeAluno").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        entrarJogo();
    }
});

document.getElementById("nomeTurma").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        entrarJogo();
    }
});

document.getElementById("resposta").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        verificarResposta();
    }
});

// ===================== FUNÇÕES DO JOGO =====================

// Função de login (MODIFICADA)
async function entrarJogo() {
  const nome = document.getElementById("nomeAluno").value.trim();
  turma = document.getElementById("nomeTurma").value.trim();

  if (!nome || !turma) {
    alert("Por favor, digite seu nome e o nome da sua turma!");
    return;
  }

  const turmaRef = doc(db, "turmas", turma);
  const turmaSnap = await getDoc(turmaRef);
  
  if (!turmaSnap.exists()) {
    alert(`A turma "${turma}" não existe. Verifique o nome ou peça para seu professor criá-la.`);
    return;
  }

  aluno = nome;
  alunoDocRef = doc(db, "alunos", aluno); // Define a referência do documento
  
  document.getElementById("alunoNome").textContent = nome;
  document.getElementById("rankingTurma").textContent = turma;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("jogo").classList.remove("hidden");

  const snap = await getDoc(alunoDocRef);

  if (snap.exists()) {
    const dadosAluno = snap.data();
    progresso = dadosAluno.progresso;
    coins = dadosAluno.coins;
    // Pega o tempo do banco de dados ao entrar no jogo (NOVO)
    tempoRestante = dadosAluno.tempoRestante || tempoPorPacote;

    if (coins <= 0) {
      await updateDoc(alunoDocRef, { coins: 10 });
      coins = 10;
      alert("Bem-vindo de volta! Suas moedas foram restauradas.");
    }
  } else {
    await setDoc(alunoDocRef, { progresso: 0, coins: 10, turma: turma, tempoRestante: tempoPorPacote });
    progresso = 0;
    coins = 10;
    alert("Novo aluno cadastrado! Bom jogo!");
  }

  atualizarTela();
  carregarRanking();
}

// Função para iniciar o jogo
function iniciarJogo() {
  document.getElementById("btnIniciar").classList.add("hidden");
  document.getElementById("btnParar").classList.remove("hidden");
  document.getElementById("questaoContainer").classList.remove("hidden");
  
  perguntasRespondidas = 0;
  
  // Reseta o tempo no banco de dados
  updateDoc(alunoDocRef, { tempoRestante: tempoPorPacote });

  // Inicia o timer
  timerInterval = setInterval(atualizarTempo, 1000);
  
  novaQuestao();
}

// Função para parar o jogo (MODIFICADA)
function pararJogo() {
  clearInterval(timerInterval);
  document.getElementById("btnIniciar").classList.remove("hidden");
  document.getElementById("btnParar").classList.add("hidden");
  document.getElementById("questaoContainer").classList.add("hidden");
  document.getElementById("resposta").value = "";
  alert("Jogo pausado. Seu progresso foi salvo!");
}

// Atualiza o tempo na tela e no banco de dados (MODIFICADA)
function atualizarTempo() {
    tempoRestante--;
    document.getElementById("tempo").textContent = tempoRestante;

    // Atualiza o tempo no Firestore a cada segundo (ATENÇÃO: pode gerar muitas escritas)
    updateDoc(alunoDocRef, { tempoRestante: tempoRestante });

    if (tempoRestante <= 0) {
        clearInterval(timerInterval);
        alert("⏰ Tempo esgotado! Seu progresso foi salvo.");
        pararJogo();
    }
}

// Gera nova questão de tabuada (MODIFICADA)
async function novaQuestao() {
  if (coins <= 0) {
    alert("⚠️ Você ficou sem moedas! Peça ao professor para liberar.");
    document.getElementById("resposta").disabled = true;
    document.getElementById("btnParar").disabled = true;
    clearInterval(timerInterval); // Para o timer
    return;
  }
  
  if (perguntasRespondidas >= 10) {
      alert("✅ Pacote de 10 questões completo! O tempo foi resetado e um novo pacote começou.");
      iniciarJogo();
      return;
  }

  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  respostaCorreta = a * b;

  document.getElementById("pergunta").textContent = `Quanto é ${a} x ${b}?`;
  document.getElementById("resposta").focus();
}

// Verifica resposta (MODIFICADA)
async function verificarResposta() {
  const resposta = parseInt(document.getElementById("resposta").value);
  if (isNaN(resposta)) {
      alert("Por favor, digite um número.");
      return;
  }
  
  if (resposta === respostaCorreta) {
    progresso++;
    coins += 5;
    perguntasRespondidas++;
    alert(`✅ Correto! Você ganhou 5 coins. Questão ${perguntasRespondidas}/10.`);
  } else {
    coins -= 3;
    alert(`❌ Errado! Perdeu 3 coins. Resposta correta: ${respostaCorreta}`);
  }

  if (coins <= 0) {
    coins = 0;
    alert("⚠️ Você ficou sem coins! Peça ao professor para liberar.");
    document.getElementById("resposta").disabled = true;
    document.getElementById("btnParar").disabled = true;
    clearInterval(timerInterval); // Para o timer
  }

  await updateDoc(alunoDocRef, { progresso, coins });

  atualizarTela();
  document.getElementById("resposta").value = "";
  novaQuestao();
}

// Atualiza tela com dados
function atualizarTela() {
  document.getElementById("progresso").textContent = progresso;
  document.getElementById("coins").textContent = coins;
  document.getElementById("tempo").textContent = tempoRestante;
}

// Ranking da turma em tempo real
function carregarRanking() {
  const alunosRef = collection(db, "alunos");
  const q = query(alunosRef, where("turma", "==", turma));

  onSnapshot(q, (snapshot) => {
    const lista = document.getElementById("ranking");
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${doc.id} - Progresso: ${data.progresso} | Coins: ${data.coins} | Tempo: ${data.tempoRestante || 'N/A'}`;
      lista.appendChild(li);
    });
  });
}
async function atualizarTempoDoServidor() {
    const snap = await getDoc(alunoDocRef);
    if (snap.exists()) {
        const dadosAluno = snap.data();
        tempoRestante = dadosAluno.tempoRestante || tempoPorPacote;
        alert(`Tempo atualizado para ${tempoRestante} segundos.`);
        atualizarTela();
    }
}

// NOVO: Modifica a função carregarRanking
function carregarRanking() {
  const alunosRef = collection(db, "alunos");
  const q = query(alunosRef, where("turma", "==", turma));

  onSnapshot(q, (snapshot) => {
    const alunos = [];
    snapshot.forEach(doc => {
      alunos.push({ id: doc.id, ...doc.data() });
    });

    // Ordena os alunos pelo progresso (do maior para o menor)
    alunos.sort((a, b) => b.progresso - a.progresso);

    const rankingTop3 = document.getElementById("rankingTop3");
    const rankingResto = document.getElementById("ranking");
    rankingTop3.innerHTML = "";
    rankingResto.innerHTML = "";

    // Exibe os 3 primeiros
    alunos.slice(0, 3).forEach((aluno, index) => {
      const li = document.createElement("div");
      li.classList.add("ranking-item", `posicao-${index + 1}`);
      li.innerHTML = `
        <span class="posicao">${index + 1}º</span>
        <span class="nome">${aluno.id}</span>
        <span class="pontuacao">🏆 ${aluno.progresso}</span>
      `;
      rankingTop3.appendChild(li);
    });

    // Exibe o restante
    alunos.slice(3).forEach(aluno => {
      const li = document.createElement("li");
      li.textContent = `${aluno.id} - Progresso: ${aluno.progresso} | Coins: ${aluno.coins} | Tempo: ${aluno.tempoRestante || 'N/A'}`;
      rankingResto.appendChild(li);
    });
  });
}

// ... (código existente, adicione a nova função ao `window`)
window.atualizarTempoDoServidor = atualizarTempoDoServidor;
window.entrarJogo = entrarJogo;
window.iniciarJogo = iniciarJogo;
window.pararJogo = pararJogo;
window.novaQuestao = novaQuestao;
window.verificarResposta = verificarResposta;