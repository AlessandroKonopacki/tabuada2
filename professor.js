// Importa Firebase da CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, updateDoc, collection, onSnapshot, deleteDoc, setDoc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBQTPYvm4yrUUUZz8-KyeGILEyF6vIma8",
  authDomain: "jogo-da-tabuada-cf924.firebaseapp.com",
  projectId: "jogo-da-tabuada-cf924",
  storageBucket: "jogo-da-tabuada-cf924.appspot.com",
  messagingSenderId: "884835175381",
  appId: "1:884835175381:web:9ca1ae363087cb24b5c",
  measurementId: "G-GJJSQS3736"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let professorLogado = null;
let turmaAtual = null;

// ===================== EVENTOS DE TECLA (NOVO) =====================
// Permite fazer login com a tecla Enter
document.getElementById("senhaProfLogin").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        loginProfessor();
    }
});

document.getElementById("nomeProfLogin").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        loginProfessor();
    }
});

// Permite criar turma com a tecla Enter
document.getElementById("nomeNovaTurma").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        criarTurma();
    }
});

// =================== Lógica de Login ===================

async function loginProfessor() {
  const nomeProf = document.getElementById("nomeProfLogin").value.trim();
  const senhaProf = document.getElementById("senhaProfLogin").value.trim();

  if (!nomeProf || !senhaProf) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const profRef = doc(db, "professores", nomeProf);
  const profSnap = await getDoc(profRef);

  if (profSnap.exists() && profSnap.data().senha === senhaProf) {
    professorLogado = nomeProf;
    document.getElementById("login-professor").classList.add("hidden");
    document.getElementById("painelProfessor").classList.remove("hidden");
    document.getElementById("bemVindo").textContent = `Bem-vindo(a), ${professorLogado}!`;
    carregarTurmas();
  } else {
    alert("Nome de professor ou senha incorretos.");
  }
}

// =================== Lógica de Turmas ===================

async function criarTurma() {
  const nomeTurma = document.getElementById("nomeNovaTurma").value.trim();

  if (!nomeTurma) {
    alert("Digite o nome da turma!");
    return;
  }

  const turmaRef = doc(db, "turmas", nomeTurma);
  const turmaSnap = await getDoc(turmaRef);

  if (turmaSnap.exists()) {
    alert("Essa turma já existe!");
  } else {
    await setDoc(turmaRef, { professor: professorLogado });
    alert(`Turma "${nomeTurma}" criada com sucesso!`);
    document.getElementById("nomeNovaTurma").value = "";
  }
}

function carregarTurmas() {
  const turmasRef = collection(db, "turmas");
  const q = query(turmasRef, where("professor", "==", professorLogado));

  onSnapshot(q, (snapshot) => {
    const lista = document.getElementById("listaTurmas");
    lista.innerHTML = "";
    snapshot.forEach(docSnap => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${docSnap.id}</strong>
        <button onclick="selecionarTurma('${docSnap.id}')">Ver Alunos</button>
        <button onclick="excluirTurma('${docSnap.id}')" class="btn-excluir">🗑️ Excluir Turma</button>
      `;
      lista.appendChild(li);
    });
  });
}

async function excluirTurma(nomeTurma) {
  if (confirm(`Tem certeza que deseja excluir a turma "${nomeTurma}" e todos os seus alunos? Esta ação é irreversível.`)) {
    const alunosRef = collection(db, "alunos");
    const q = query(alunosRef, where("turma", "==", nomeTurma));
    const alunosParaExcluir = await getDocs(q);

    const promisesDeExclusao = alunosParaExcluir.docs.map(alunoDoc => deleteDoc(doc(db, "alunos", alunoDoc.id)));
    await Promise.all(promisesDeExclusao);

    const turmaRef = doc(db, "turmas", nomeTurma);
    await deleteDoc(turmaRef);

    alert(`Turma "${nomeTurma}" e todos os seus alunos foram excluídos com sucesso!`);
  }
}

function selecionarTurma(nomeTurma) {
  turmaAtual = nomeTurma;
  document.getElementById("turmaAtual").textContent = turmaAtual;
  document.getElementById("gerenciarAlunos").classList.remove("hidden");
  carregarAlunosPorTurma();
}

// =================== Lógica de Alunos ===================

function carregarAlunosPorTurma() {
  const alunosRef = collection(db, "alunos");
  const q = query(alunosRef, where("turma", "==", turmaAtual));

  onSnapshot(q, (snapshot) => {
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

async function liberarCoins(nome) {
  const ref = doc(db, "alunos", nome);
  await updateDoc(ref, { coins: 10 });
}

async function resetarAluno(nome) {
  const ref = doc(db, "alunos", nome);
  await updateDoc(ref, { progresso: 0, coins: 10 });
}

async function excluirAluno(nome) {
  if (confirm(`Tem certeza que deseja excluir o aluno ${nome}?`)) {
    const ref = doc(db, "alunos", nome);
    await deleteDoc(ref);
    alert(`Aluno ${nome} excluído com sucesso!`);
  }
}

// Expõe funções ao HTML
window.loginProfessor = loginProfessor;
window.criarTurma = criarTurma;
window.selecionarTurma = selecionarTurma;
window.excluirTurma = excluirTurma;
window.liberarCoins = liberarCoins;
window.resetarAluno = resetarAluno;
window.excluirAluno = excluirAluno;