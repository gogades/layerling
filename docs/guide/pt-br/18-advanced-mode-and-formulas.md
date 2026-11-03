---
title: Modo avançado e fórmulas
summary: Fórmulas nos campos numéricos, variáveis, corpos que seguem outros corpos, a tabela de variáveis e o editor de fórmulas - tudo ativado com o modo avançado.
---

## Ativar o modo avançado

Alguns projetos ficam mais simples quando um valor comanda outros: uma tampa sempre 0,4 mm menor que a sua caixa, furos espaçados pela mesma espessura de parede, uma peça que fica ao lado de outra aonde quer que ela vá. Para isso, o modo avançado adiciona fórmulas e variáveis. Ative {{ui:workspace.advancedMode}} em {{ui:editor.workspaceSettings}}, na aba {{ui:workspace.appearance}}. Ninguém mais encontra nada disso: no modo normal e no simples, os campos, o inspetor e a faixa de opções continuam como estão.

Um projeto com fórmulas também abre sem o modo avançado. Ele mostra os últimos valores das suas fórmulas, e um aviso diz que ele usa fórmulas, com {{ui:advanced.switchOn}}. Um valor que você mudar ali passa a ser um número comum: a fórmula dele é removida, então voltar ao modo avançado nunca desfaz a sua mudança.

## Fórmulas nos campos numéricos

No modo avançado, cada campo numérico do inspetor aceita uma fórmula. Digite como um cálculo:

| Escreva | Significado |
| --- | --- |
| `$wall * 2` | o dobro da variável `wall` da tabela de variáveis |
| `$lid.size.width - 0.4` | a largura do corpo chamado `lid`, menos 0,4 |
| `$lid.position.x + 30` | 30 à direita de `lid` |
| `$self.size.width / 2` | metade da largura deste mesmo corpo |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | arredondamento (as metades para longe do zero), raiz quadrada, seno e cosseno em graus, pi |

Os nomes começam com `$`. Maiúsculas e minúsculas não importam: `$Wall` e `$wall` são a mesma coisa. Os números ficam na unidade em que o projeto mostra seus campos; dentro de uma fórmula não há unidades.

Um campo comandado por uma fórmula fica colorido e marcado com *fx*. Clique nele e a fórmula volta para ser alterada. Uma fórmula que não pode ser calculada - um nome que não existe, uma divisão por zero, duas fórmulas que dependem uma da outra - deixa o campo vermelho, e a dica dele diz por quê. Enquanto isso, o campo mantém seu último valor. Digitar um número comum no campo tira a fórmula de novo. As caixas de medidas na área de trabalho fazem o mesmo: uma largura, comprimento, altura ou altura acima da mesa comandada por uma fórmula mostra *fx* na sua caixa, e um clique abre a caixa com a fórmula, com o *fx* na frente para abrir o editor de fórmulas.

## Dar um nome de variável a um corpo

Uma fórmula pode ler qualquer campo de um corpo que tenha nome de variável. Dê um em {{ui:formula.variableName}}, no topo do inspetor: letras, dígitos e `_`, sem começar com dígito e diferente de qualquer outro corpo ou variável. Os campos dele passam a se chamar assim:

| Campo | Em uma fórmula |
| --- | --- |
| Largura, comprimento, altura, diâmetro | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; num corpo redondo, a largura e o comprimento são o seu diâmetro |
| Posição X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotação X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Pivô X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Afunilamento, torção e as configurações próprias da forma | agrupados pelo que pertencem, por exemplo `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; depois de `$name.` o editor de fórmulas lista todos |

Renomear o corpo renomeia em todas as fórmulas que o usam. Uma cópia de um corpo com nome - colada, duplicada ou inserida - não mantém o nome, já que dois corpos não podem compartilhá-lo; uma mensagem curta avisa.

## A tabela de variáveis

{{ui:variables.title}} abre pelo botão ao lado de {{ui:editor.tool.note}} no canto inferior esquerdo ou com [[Ctrl]]+[[Shift]]+[[V]]. Cada linha tem um nome, um valor ou fórmula, o resultado e uma descrição curta. {{ui:variables.add}} adiciona uma linha; a lixeira remove uma. Uma mudança vale assim que você aperta [[Enter]] ou sai da célula, e [[Ctrl]]+[[Z]] a desfaz como qualquer outro passo. Um resultado que não pode ser calculado mostra uma marca vermelha; a dica dela diz por quê. Renomear uma linha a renomeia em todas as fórmulas. Abaixo da tabela, você vê quais corpos têm nome de variável. A janela se move pelo título e aumenta pelo canto inferior direito.

## O editor de fórmulas

Uma fórmula mais longa fica mais fácil no editor de fórmulas: clique no *fx* no início de um campo guiado por uma fórmula, ou clique em qualquer campo e depois no *fx* que aparece no início dele. Ele mostra o resultado enquanto você digita, ou por que não há resultado. Depois de `$`, lista as variáveis e os corpos com nome; depois de `$name.`, os campos daquele corpo, cada um com seu valor; as setas e [[Enter]] ou [[Tab]] escolhem um. Em seguida, [[Enter]] aplica a fórmula, [[Shift]]+[[Enter]] começa uma linha nova para manter uma fórmula longa legível e [[Esc]] fecha o editor sem mudanças. Ele se move pelo título.

## Quando os valores mudam

Tudo o que depende de um valor alterado acompanha na hora, como um só passo do histórico: um corpo que segue `lid` se move quando `lid` cresce. Vale saber algumas coisas:

- **Arrastar um campo que tem fórmula** mantém a fórmula e soma a diferença: `$wall * 2` arrastado 5 mm além vira `$wall * 2 + 5`. Mover um corpo junto com o corpo que ele segue não muda nada na fórmula dele.
- **Um corpo travado** não segue suas fórmulas; o campo dele avisa.
- **As peças dentro de um grupo** mantêm suas fórmulas e nomes de variável quando o grupo está fechado, e as fórmulas podem lê-las. Quando muda um valor do qual elas dependem, o grupo é reconstruído um instante depois do resto, no mesmo passo do histórico. Mover ou esticar o grupo soma a diferença às fórmulas das suas peças, como ao arrastar. Um grupo com arredondamentos ou chanfros próprios não é reconstruído; abra-o com {{ui:group.edit}} para atualizá-lo.
