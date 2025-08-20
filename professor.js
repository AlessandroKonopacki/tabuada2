// Importa Firebase da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let professorLogado = null;

const tempoPadrao = 60; // Deve ser o mesmo valor de `tempoPorPacote` em main.js

// ===================== FUNÇÕES DO PAINEL =====================

// Função de login
async function loginProfessor() {
    const nome = document.getElementById("nomeProfLogin").value.trim();
    const senha = document.getElementById("senhaProfLogin").value.trim();

    if (!nome || !senha) {
        alert("Por favor, preencha o nome e a senha.");
        return;
    }

    const professorRef = doc(db, "professores", nome);
    const professorSnap = await getDoc(professorRef);

    if (professorSnap.exists() && professorSnap.data().senha === senha) {
        professorLogado = nome;
        document.getElementById("login-professor").classList.add("hidden");
        document.getElementById("painelProfessor").classList.remove("hidden");
        document.getElementById("bemVindo").textContent = `Bem-vindo(a), Professor(a) ${nome}!`;
        carregarTurmas();
    } else {
        alert("Credenciais incorretas.");
    }
}

// Cria uma nova turma
async function criarTurma() {
    const nomeTurma = document.getElementById("nomeNovaTurma").value.trim();
    if (!nomeTurma) {
        alert("Digite um nome para a turma!");
        return;
    }

    const turmaRef = doc(db, "turmas", nomeTurma);
    await setDoc(turmaRef, { professor: professorLogado });
    alert(`Turma "${nomeTurma}" criada com sucesso!`);
    document.getElementById("nomeNovaTurma").value = "";
}

// Carrega as turmas do professor logado
function carregarTurmas() {
    const turmasRef = collection(db, "turmas");
    const q = query(turmasRef, where("professor", "==", professorLogado));

    onSnapshot(q, (snapshot) => {
        const lista = document.getElementById("listaTurmas");
        lista.innerHTML = "";
        snapshot.forEach(docSnap => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${docSnap.id}</span>
                <button onclick="gerenciarAlunos('${docSnap.id}')">Gerenciar</button>
            `;
            lista.appendChild(li);
        });
    });
}

// Carrega os alunos de uma turma específica
function gerenciarAlunos(nomeTurma) {
    document.getElementById("gerenciarTurmas").classList.add("hidden");
    document.getElementById("gerenciarAlunos").classList.remove("hidden");
    document.getElementById("turmaAtual").textContent = nomeTurma;

    const alunosRef = collection(db, "alunos");
    const q = query(alunosRef, where("turma", "==", nomeTurma));

    onSnapshot(q, (snapshot) => {
        const lista = document.getElementById("listaAlunos");
        lista.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${docSnap.id}</strong> - Progresso: ${data.progresso} | Moedas: ${data.coins} | Tempo: ${data.tempoRestante || 'N/A'}s
                <button onclick="resetarAluno('${docSnap.id}')">♻️ Resetar Aluno</button>
                <button onclick="resetarTempo('${docSnap.id}')">⏳ Resetar Tempo</button>
                <button onclick="excluirAluno('${docSnap.id}')">❌ Excluir Aluno</button>
            `;

            lista.appendChild(li);
        });
    });
}

// Resetar o tempo de um aluno
async function resetarTempo(nome) {
    const ref = doc(db, "alunos", nome);
    await updateDoc(ref, { tempoRestante: tempoPadrao, coins: 10 });
    alert(`Tempo do aluno ${nome} resetado e 10 moedas liberadas!`);
}

// Resetar o progresso de um aluno
async function resetarAluno(nome) {
    const ref = doc(db, "alunos", nome);
    await updateDoc(ref, { progresso: 0, coins: 10 });
    alert(`Progresso do aluno ${nome} resetado!`);
}

// Excluir um aluno (NOVA FUNÇÃO)
async function excluirAluno(nome) {
  if (confirm(`Tem certeza que deseja excluir o aluno ${nome}? Esta ação é irreversível.`)) {
    const ref = doc(db, "alunos", nome);
    await deleteDoc(ref);
    alert(`Aluno ${nome} excluído com sucesso!`);
  }
}

// ===================== EXPOR FUNÇÕES PARA O HTML =====================
window.loginProfessor = loginProfessor;
window.criarTurma = criarTurma;
window.carregarTurmas = carregarTurmas;
window.gerenciarAlunos = gerenciarAlunos;
window.resetarTempo = resetarTempo;
window.resetarAluno = resetarAluno;
window.excluirAluno = excluirAluno; // Expõe a nova função