// Importa Firebase direto da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// Variáveis de estado
let aluno = null;
let turma = null;
let progresso = 0;
let coins = 0;
let respostaCorreta = 0;
let tempoRestante = 0;
let timerInterval = null;
let alunoDocRef = null;

const tempoPorPacote = 60;

// Lógica para entrar no jogo
async function entrarJogo() {
    const nomeAluno = document.getElementById("nomeAluno").value.trim();
    const nomeTurma = document.getElementById("nomeTurma").value.trim();

    if (nomeAluno === "" || nomeTurma === "") {
        alert("Por favor, preencha seu nome e o nome da turma.");
        return;
    }

    aluno = nomeAluno;
    turma = nomeTurma;

    alunoDocRef = doc(db, "alunos", aluno);

    try {
        const snap = await getDoc(alunoDocRef);

        if (!snap.exists()) {
            await setDoc(alunoDocRef, {
                turma: turma,
                progresso: 0,
                coins: 10,
                tempoRestante: tempoPorPacote,
                dataUltimoLogin: serverTimestamp()
            });
            alert(`Bem-vindo, ${aluno}! Seu perfil foi criado.`);
            progresso = 0;
            coins = 10;
            tempoRestante = tempoPorPacote;
        } else {
            const dadosAluno = snap.data();
            progresso = dadosAluno.progresso;
            coins = dadosAluno.coins;
            tempoRestante = dadosAluno.tempoRestante || tempoPorPacote;
            alert(`Bem-vindo de volta, ${aluno}!`);
        }

        document.getElementById("alunoNome").textContent = aluno;
        document.getElementById("rankingTurma").textContent = turma;
        
        document.getElementById("login").classList.add("hidden");
        document.getElementById("jogo").classList.remove("hidden");

        atualizarTela();
        carregarRanking();
        
        // Verifica se há tempo para iniciar o jogo
        if (tempoRestante > 0) {
            novaQuestao();
        } else {
            alert("Seu tempo acabou! Peça ao professor para adicionar mais tempo.");
        }

    } catch (e) {
        console.error("Erro ao entrar no jogo: ", e);
        alert("Ocorreu um erro ao tentar entrar. Verifique sua conexão ou tente novamente.");
    }
}

// Lógica para iniciar o jogo
function iniciarJogo() {
    if (progresso === 0) {
        novaQuestao();
    }
    document.getElementById("btnIniciar").classList.add("hidden");
    document.getElementById("btnParar").classList.remove("hidden");
    document.getElementById("questaoContainer").classList.remove("hidden");
    
    // Inicia o timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarTela();
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            alert("Seu tempo acabou! Parando o jogo.");
            pararJogo();
        }
    }, 1000);
}

// Lógica para parar e salvar o jogo
async function pararJogo() {
    clearInterval(timerInterval);
    document.getElementById("btnIniciar").classList.remove("hidden");
    document.getElementById("btnParar").classList.add("hidden");
    document.getElementById("questaoContainer").classList.add("hidden");
    
    // Salva o estado atual no banco de dados
    if (alunoDocRef) {
        await updateDoc(alunoDocRef, { progresso, coins, tempoRestante });
        alert("Progresso salvo com sucesso!");
    }
}

// Lógica para a próxima questão
function novaQuestao() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  respostaCorreta = num1 * num2;
  document.getElementById("pergunta").textContent = `Quanto é ${num1} x ${num2}?`;
}

// Lógica para verificar a resposta
async function verificarResposta() {
  const respostaAluno = parseInt(document.getElementById("resposta").value);
  if (isNaN(respostaAluno)) {
    alert("Por favor, digite um número.");
    return;
  }
  
  if (respostaAluno === respostaCorreta) {
    progresso++;
    coins++;
    alert("✅ Resposta correta!");
  } else {
    coins--;
    alert(`❌ Resposta incorreta! A resposta era ${respostaCorreta}`);
  }

  if (coins <= 0) {
    coins = 0;
    alert("⚠️ Você ficou sem coins! Peça ao professor para liberar.");
    document.getElementById("resposta").disabled = true;
    document.getElementById("btnParar").disabled = true;
    clearInterval(timerInterval);
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

// NOVO: Adiciona a função para atualizar o tempo do servidor
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

    alunos.sort((a, b) => b.progresso - a.progresso);

    const rankingTop3 = document.getElementById("rankingTop3");
    const rankingResto = document.getElementById("ranking");
    rankingTop3.innerHTML = "";
    rankingResto.innerHTML = "";

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

    alunos.slice(3).forEach(aluno => {
      const li = document.createElement("li");
      li.textContent = `${aluno.id} - Progresso: ${aluno.progresso} | Coins: ${aluno.coins} | Tempo: ${aluno.tempoRestante || 'N/A'}`;
      rankingResto.appendChild(li);
    });
  });
}

// ===================== EXPOR FUNÇÕES PARA O HTML =====================
// Necessário porque o script é do tipo "module"
window.entrarJogo = entrarJogo;
window.iniciarJogo = iniciarJogo;
window.pararJogo = pararJogo;
window.novaQuestao = novaQuestao;
window.verificarResposta = verificarResposta;
window.atualizarTempoDoServidor = atualizarTempoDoServidor;