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

  // Verifica se o aluno já existe no banco de dados
  if (snap.exists()) {
    // Se existir, carrega os dados dele
    const dadosAluno = snap.data();
    progresso = dadosAluno.progresso;
    coins = dadosAluno.coins;

    // Se o aluno retornar com moedas zeradas, restaura para 10
    if (coins <= 0) {
      await updateDoc(ref, { coins: 10 });
      coins = 10;
      alert("Bem-vindo de volta! Suas moedas foram restauradas.");
    }
  } else {
    // Se for um novo aluno, cria um novo registro com 10 moedas iniciais
    await setDoc(ref, { progresso: 0, coins: 10 });
    progresso = 0;
    coins = 10;
    alert("Novo aluno cadastrado! Bom jogo!");
  }

  // Atualiza o painel do aluno e o ranking para todos
  atualizarTela();
  carregarRanking();
  novaQuestao(); // Já exibe a primeira questão
}