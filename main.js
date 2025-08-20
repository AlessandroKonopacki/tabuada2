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
    // Se o aluno já existe, carrega os dados dele.
    progresso = snap.data().progresso;
    coins = snap.data().coins;
  } else {
    // Se for um novo aluno, cria um novo registro com 10 moedas iniciais.
    await setDoc(ref, { progresso: 0, coins: 10 });
    progresso = 0;
    coins = 10;
  }

  // Se o aluno tiver 0 moedas, garante que ele comece com 10.
  // Isso resolve o problema de alunos que retornam com saldo zerado.
  if (coins <= 0) {
    await updateDoc(ref, { coins: 10 });
    coins = 10;
    alert("Bem-vindo de volta! Moedas restauradas.");
  }

  atualizarTela();
  carregarRanking();
}