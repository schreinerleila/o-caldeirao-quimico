# O Caldeirão Químico

Jogo educativo narrativo sobre famílias da Tabela Periódica. Luna recebe visitantes em seu laboratório e usa pistas do Grimório para preparar poções. O projeto funciona localmente no navegador, com HTML, CSS e JavaScript, sem instalação de dependências.

## Jornada

- Abertura com a arte `frontpage.png`, controle de som e guia de leitura da tabela.
- Prólogo interativo para conhecer símbolo, nome, número atômico, massa atômica e famílias.
- Sete missões: gases nobres, metais de transição, metais alcalinos, calcogênios, halogênios, família do carbono e desafio final.
- Conversas em quadros de HQ, entrada dos personagens, aproximação do caldeirão e animações de ingredientes, acerto e erro.
- Grimório lateral com pistas e tabela interativa. Os frascos selecionados voam até o caldeirão na cena; a mistura é acionada junto dele, fora do livro.
- O progresso fica salvo neste navegador.
- As artes originais são preservadas; cópias com fundo removido ficam em `static/images/cutouts/`.
- Efeitos sonoros existentes em `static/audio/` e música sintetizada pelo navegador.

## Executar

Abra `index.html` em um navegador moderno ou sirva a pasta com um servidor estático. Por exemplo:

```sh
ruby -run -e httpd . -p 8765
```

Acesse `http://localhost:8765`.

## Controles

- Clique na caixa de diálogo para avançar a história.
- Abra o Grimório e toque nos elementos para ver número atômico, massa e família.
- Selecione a quantidade de ingredientes indicada e mexa o caldeirão.
- Use o botão de som para alternar áudio.

## Arquivos principais

- `js/app.js`: cenas, história e interações.
- `js/data/phases.js`: capítulos, pistas, receitas e reações.
- `js/data/elements.js`: elementos e famílias exibidos no Grimório.
- `css/main.css` e `css/story-overrides.css`: visual, responsividade e animações.
- `static/images/` e `static/audio/`: artes e sons do jogo.
