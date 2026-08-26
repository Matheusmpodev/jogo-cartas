
const tipos_de_cartas = //cria a const com os tipos de cartas
{
    dano: { nome: 'Dano', tipo: 'dano', valor: 15, desc: '20 de dano', img: 'imagens/carta 02.png' },
    vida: { nome: 'Vida', tipo: 'vida', valor: 20, desc: 'Cura 20 HP', img: 'imagens/carta 04.png' },
    escudo: { nome: 'Escudo', tipo: 'escudo', valor: 25, desc: '+25 escudo', img: 'imagens/carta 01.png' },
    veneno: { nome: 'Veneno', tipo: 'veneno', valor: 15, desc: '8 dmg x2', img: 'imagens/carta 03.png' },
};



const estado_game = // cria um estado geral inicial pro jogo
{
    vidaMaxima: 100,
    turnoAtual: 1,
    jogadorAtual: 'p1',
    jogoAtivo: false,
    p1: { vida: 100, escudo: 0, veneno: 0, mao: [], baralho: [] },
    p2: { vida: 100, escudo: 0, veneno: 0, mao: [], baralho: [] },
};

barraDeVida('p1');
barraDeVida('p2');

function comecarPartida() {
    document.getElementById('tela-inicial').classList.add('escondida');
    iniciarJogo();
}

function iniciarJogo() {
    document.getElementById('botao-iniciar').style.display = 'none';
    document.getElementById('log').innerHTML = '';
    fecharMensagemFinal();

    estado_game.p1 = { vida: 100, escudo: 0, veneno: 0, mao: [], baralho: embaralhar(criarBaralho()) };
    estado_game.p2 = { vida: 100, escudo: 0, veneno: 0, mao: [], baralho: embaralhar(criarBaralho()) };
    estado_game.turnoAtual = 1;
    estado_game.jogoAtivo = true;

    for (let i = 0; i < 5; i++) {
        draw('p1');
        draw('p2');
    }

    adicionarLog('=== Jogo iniciado! ===');
    atualizar_tela();
    iniciarTurnoP1();
}



function criarBaralho() {
    const cartas_baralho = [
        'dano', 'dano', 'dano', 'dano', 'dano', 'dano', 'dano', 'dano', 'dano', 'dano',
        'vida', 'vida', 'vida', 'vida', 'vida',
        'escudo', 'escudo', 'escudo', 'escudo',
        'veneno', 'veneno', 'veneno',
    ];
    return cartas_baralho.map((tipo, indice) => ({ ...tipos_de_cartas[tipo], id: indice }));
}

function embaralhar(array_baralho) {
    for (let i = array_baralho.length - 1; i > 0; i--) {
        const i1 = Math.floor(Math.random() * (i + 1));
        let a1 = array_baralho[i];
        array_baralho[i] = array_baralho[i1];
        array_baralho[i1] = a1;
    }
    return array_baralho;
}

function draw(jogadorId) {
    const esta = estado_game[jogadorId];
    if (esta.baralho.length > 0) {
        esta.mao.push(esta.baralho.pop());
    }
}


function adicionarLog(msg) {
    const log = document.getElementById('log');
    const p = document.createElement('p');
    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function atualizar_tela() {
    barraDeVida('p1');
    barraDeVida('p2');
    atualizarInfoMao('p1');
    atualizarInfoMao('p2');
    renderizarMao('p2', false);
}

function barraDeVida(jogadorId) {
    const esta = estado_game[jogadorId];
    const porcentagem = Math.max(0, Math.min(100, (esta.vida / estado_game.vidaMaxima) * 100));

    const perdido = 100 - porcentagem;
    const estagio = perdido <= 0 ? 1 : Math.min(6, Math.max(1, Math.ceil((perdido / 100) * 6)));
    const numero = String(estagio).padStart(2, '0');

    document.getElementById(`vida-${jogadorId}`).src = `imagens/vida/vida ${numero}.png`;
    document.getElementById(`texto-vida-${jogadorId}`).textContent = `${esta.vida} / ${estado_game.vidaMaxima}`;
}

function atualizarInfoMao(jogadorId) {
    const esta = estado_game[jogadorId];

    const Baralho_ = document.getElementById(`baralho-${jogadorId}`);
    Baralho_.textContent = `🂠 Baralho: ${esta.baralho.length}`;

    const Escudo_ = document.getElementById(`escudo-${jogadorId}`);
    Escudo_.textContent = esta.escudo > 0 ? `🛡️ Escudo: ${esta.escudo}` : '';
    Escudo_.className = esta.escudo > 0 ? 'com-escudo' : '';

    const Veneno_ = document.getElementById(`veneno-${jogadorId}`);
    Veneno_.textContent = esta.veneno > 0 ? `☠️ Veneno (${esta.veneno})` : '';
    Veneno_.className = esta.veneno > 0 ? 'envenenado' : '';
}

function renderizarMao(jogadorId, clicavel) {
    const esta = estado_game[jogadorId];
    const container = document.getElementById(`mao-${jogadorId}`);
    container.innerHTML = '';

    esta.mao.forEach((carta, indice) => {
        const div = document.createElement('div');
        div.className = `carta${clicavel ? ' clicavel' : ''}`;

        div.innerHTML = `
            <div class="carta-imagem"><img src="${carta.img}" alt="${carta.nome}" class="carta-img"></div>
            <div class="carta-nome">${carta.nome}</div>
            <div class="carta-desc">${carta.desc}</div>
        `;

        if (clicavel) {
            div.onclick = () => jogarCarta(indice);
        }
        container.appendChild(div);
    });
}


function iniciarTurnoP1() {
    if (!estado_game.jogoAtivo) {
        return;
    }
    aplicarVeneno('p1');
    atualizar_tela();
    if (verificarFimDeJogo()) {
        return;
    }
    estado_game.jogadorAtual = 'p1';
    atualizarTurnoTexto();
    renderizarMao('p1', true);
    renderizarMao('p2', false);
}

function aplicarVeneno(jogadorId) {
    const esta = estado_game[jogadorId];
    if (esta.veneno <= 0) return;

    let dano = tipos_de_cartas.veneno.valor;

    if (esta.escudo > 0) {
        const absorvido = Math.min(esta.escudo, dano);
        esta.escudo -= absorvido;
        dano -= absorvido;
        if (absorvido > 0) {
            adicionarLog(`Escudo de ${jogadorId.toUpperCase()} absorveu ${absorvido} do veneno.`);
        }
    }

    esta.vida = Math.max(0, esta.vida - dano);
    esta.veneno--;

    adicionarLog(`Veneno: ${jogadorId.toUpperCase()} sofreu ${dano} de dano. (${esta.veneno} turno(s) restante(s))`);
}

function verificarFimDeJogo() {
    const p1 = estado_game.p1;
    const p2 = estado_game.p2;

    if (p1.vida <= 0 && p2.vida <= 0) {
        encerrarJogo('empate');
        return true;
    }
    if (p1.vida <= 0) {
        encerrarJogo('p2');
        return true;
    }
    if (p2.vida <= 0) {
        encerrarJogo('p1');
        return true;
    }
    return false;
}



function atualizarTurnoTexto() {
    const texto = estado_game.jogadorAtual === 'p1'
        ? `Turno ${estado_game.turnoAtual} — Sua vez (P1)`
        : `Turno ${estado_game.turnoAtual} — Vez do P2...`;
    document.getElementById('turno-texto').textContent = texto;
}

function jogarCarta(carta_Indice) {
    if (!estado_game.jogoAtivo || estado_game.jogadorAtual !== 'p1') return;

    const p1 = estado_game.p1;
    const carta = p1.mao[carta_Indice];
    if (!carta) {
        return;
    }

    p1.mao.splice(carta_Indice, 1);
    adicionarLog(`[Turno ${estado_game.turnoAtual}] P1 jogou ${carta.nome}.`);
    executarCarta(carta, 'p1', 'p2');

    draw('p1');
    atualizar_tela();
    if (verificarFimDeJogo()) {
        return;
    }
    estado_game.jogadorAtual = 'p2';
    atualizarTurnoTexto();
    renderizarMao('p1', false);

    setTimeout(iniciarTurnoP2, 1200);
}

function executarCarta(carta, atacanteId, alvoId) {
    switch (carta.tipo) {
        case 'dano': cartaDano(atacanteId, alvoId); break;
        case 'vida': cartaVida(atacanteId); break;
        case 'escudo': cartaEscudo(atacanteId); break;
        case 'veneno': cartaVeneno(atacanteId, alvoId); break;
    }
}




function cartaDano(atacanteId, alvoId) {
    const alvo = estado_game[alvoId];
    const sorte = 1 + Math.random()
    let dano = Math.round(tipos_de_cartas.dano.valor * sorte);

    if (alvo.escudo > 0) {
        const absorvido = Math.min(alvo.escudo, dano);
        alvo.escudo -= absorvido;
        dano -= absorvido;
        if (absorvido > 0) {
            adicionarLog(`Escudo de ${alvoId.toUpperCase()} absorveu ${absorvido} de dano.`);
        }
    }

    alvo.vida = Math.max(0, alvo.vida - dano);
    if (dano > 0) {
        adicionarLog(`${atacanteId.toUpperCase()} causou ${dano} de dano em ${alvoId.toUpperCase()}.`);
    }
}

function cartaVida(jogadorId) {
    const esta = estado_game[jogadorId];
    const cura = Math.min(tipos_de_cartas.vida.valor, estado_game.vidaMaxima - esta.vida);
    esta.vida += cura;
    adicionarLog(`${jogadorId.toUpperCase()} curou ${cura} HP. (${esta.vida}/${estado_game.vidaMaxima})`);
}

function cartaEscudo(jogadorId) {
    const esta = estado_game[jogadorId];
    esta.escudo += tipos_de_cartas.escudo.valor;
    adicionarLog(`${jogadorId.toUpperCase()} ganhou ${tipos_de_cartas.escudo.valor} de escudo. Total: ${esta.escudo}`);
}

function cartaVeneno(atacanteId, alvoId) {
    estado_game[alvoId].veneno = 2;
    adicionarLog(`${atacanteId.toUpperCase()} envenenou ${alvoId.toUpperCase()}! ${tipos_de_cartas.veneno.valor} de dano por 2 turnos.`);
}





function iniciarTurnoP2() {
    if (!estado_game.jogoAtivo) return;

    aplicarVeneno('p2');
    atualizar_tela();
    if (verificarFimDeJogo()) return;

    const p2 = estado_game.p2;

    if (p2.mao.length > 0) {
        const aleatorio = Math.floor(Math.random() * p2.mao.length);
        const carta = p2.mao[aleatorio];
        p2.mao.splice(aleatorio, 1);
        adicionarLog(`[Turno ${estado_game.turnoAtual}] P2 jogou ${carta.nome}.`);
        executarCarta(carta, 'p2', 'p1');
    } else {
        adicionarLog(`[Turno ${estado_game.turnoAtual}] P2 não tem cartas e passou o turno.`);
    }

    draw('p2');
    atualizar_tela();
    if (verificarFimDeJogo()) return;


    if (estado_game.p1.mao.length === 0 && estado_game.p2.mao.length === 0) {
        encerrarJogo('empate');
        return;
    }

    estado_game.turnoAtual++;
    setTimeout(iniciarTurnoP1, 400);
}



function encerrarJogo(resultado) {
    estado_game.jogoAtivo = false;

    let msg;
    let mensagemFinal;
    if (resultado === 'empate') {
        msg = 'Empate! Ambos os baralhos acabaram.';
        mensagemFinal = 'Empate! Ninguém farmou aura dessa vez.';
    } else if (resultado === 'p1') {
        msg = 'P1 venceu!';
        mensagemFinal = 'Você farmou aura!';
    } else {
        msg = 'P2 venceu!';
        mensagemFinal = 'Você foi moggado!';
    }

    adicionarLog(`=== ${msg} ===`);
    document.getElementById('turno-texto').textContent = msg;
    mostrarMensagemFinal(mensagemFinal);

    const botao = document.getElementById('botao-iniciar');
    botao.textContent = 'Jogar Novamente';
    botao.style.display = 'inline-block';
    renderizarMao('p1', false);
}

function mostrarMensagemFinal(texto) {
    document.getElementById('overlay-fim-texto').textContent = texto;
    document.getElementById('overlay-fim').classList.add('ativo');
}

function fecharMensagemFinal() {
    document.getElementById('overlay-fim').classList.remove('ativo');
}
