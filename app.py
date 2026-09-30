from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

PHASES = {
    1: {"titulo": "Gases Nobres — Vestido de Gala", "familia": "Gases Nobres", "dica": "Para o vestido flutuar e brilhar em tom rosa-avermelhado, misture o elemento mais leve do grupo (Número Atômico 2) com o gás famoso pelos letreiros luminosos (Massa Atômica aproximadamente 20)!", "receita": ["He", "Ne"], "erro": "Fumaça cinza e vestido de trapo de rocha pesado.", "sucesso": "O vestido de gala flutua e brilha em rosa-avermelhado!", "animacao": "vestido_neon"},
    2: {"titulo": "Metais de Transição — Acalmar o Lobisomem", "familia": "Metais de Transição", "dica": "Para acalmar a fera, procure um metal precioso brilhante de Número Atômico 47 e junte com o metal mais abundante no núcleo da Terra, de símbolo Fe!", "receita": ["Ag", "Fe"], "erro": "O caldeirão explode e o Lobisomem vira um Pinscher raivoso.", "sucesso": "A coleira prateada acalma o Lobisomem.", "animacao": "coleira_prata"},
    3: {"titulo": "Metais Alcalinos — Aquecer o Monstro das Neves", "familia": "Metais Alcalinos", "dica": "Procure dois metais da Família 1A que reagem intensamente com a água: o elemento presente no sal de cozinha (Número Atômico 11) e o elemento abundante nas bananas (Símbolo K)!", "receita": ["Na", "K"], "erro": "Explosão de fuligem preta e Monstro das Neves derrete em uma poça.", "sucesso": "A poção de fogo aquece a lareira.", "animacao": "pocao_fogo"},
    4: {"titulo": "Calcogênios — Tônico para a Múmia", "familia": "Calcogênios", "dica": "Combine o gás essencial para a nossa respiração (Massa Atômica 16) com o elemento de Número Atômico 34 da mesma família dos Calcogênios!", "receita": ["O", "Se"], "erro": "Fumaça amarela fedorenta a enxofre e as ataduras da Múmia caem.", "sucesso": "O tônico revitaliza a Múmia.", "animacao": "tonico_mumia"},
    5: {"titulo": "Halogênios — Poção Branqueadora para Vlad", "familia": "Halogênios", "dica": "Para uma limpeza profunda, use o halogênio mais eletronegativo da tabela (Número Atômico 9) combinado com o elemento usado na purificação de piscinas (Símbolo Cl)!", "receita": ["F", "Cl"], "erro": "Dentes do Vampiro caem.", "sucesso": "O sorriso do Vampiro Vlad volta a brilhar.", "animacao": "sorriso_vlad"},
    6: {"titulo": "Família do Carbono — Armadura para Frankenstein", "familia": "Família do Carbono", "dica": "Para criar uma armadura de cristal e semicondutores, combine o elemento base da vida e dos diamantes (Número Atômico 6) com o elemento de Símbolo Si!", "receita": ["C", "Si"], "erro": "Bloco de chumbo pesado cai no pé do Frankenstein.", "sucesso": "A armadura cristalina protege Frankenstein.", "animacao": "armadura_cristal"},
    7: {"titulo": "Desafio Final — Dragão de Cristal", "familia": "Fusão de famílias", "dica": "1. Gás inerte de Número Atômico 10 e Massa Atômica ~20,18. 2. Metal nobre de Massa Atômica ~107,87 e Símbolo Ag. 3. Elemento mais eletronegativo da tabela, Família 17, Número Atômico 9.", "receita": ["Ne", "Ag", "F"], "erro": "Fumaça roxa e bolha de sabão que prende a Luna.", "sucesso": "O Dragão de Cristal recupera seu brilho mágico!", "animacao": "dragao_cristal"},
}

@app.get("/")
def index():
    return render_template("index.html", phases=PHASES)

@app.get("/api/fases/<int:fase>")
def fase(fase):
    data = PHASES.get(fase)
    return (jsonify(data), 200) if data else (jsonify({"erro": "Fase inválida."}), 404)

@app.post("/verificar_pocao")
def verificar_pocao():
    data = request.get_json(silent=True) or {}
    fase = data.get("fase")
    simbolos = data.get("simbolos", [])
    phase = PHASES.get(fase)
    if not phase or not isinstance(simbolos, list):
        return jsonify({"sucesso": False, "mensagem": "Requisição inválida.", "animacao": "erro"}), 400
    sucesso = sorted(simbolos) == sorted(phase["receita"])
    return jsonify({"sucesso": sucesso, "mensagem": phase["sucesso"] if sucesso else phase["erro"], "animacao": phase["animacao"] if sucesso else "erro_" + str(fase)})

if __name__ == "__main__":
    app.run(debug=True)
