function TransitionRelation(
  state,
  inputSymbol,
  stackSymbol,
  nextState,
  pushToStack = []
) {
  return {
    state,
    inputSymbol,
    stackSymbol,
    nextState,
    pushToStack,

    match(state, inputSymbol, stackSymbol) {
      return (
        state === this.state &&
        inputSymbol === this.inputSymbol &&
        stackSymbol === this.stackSymbol
      );
    },

    toString() {
      const left = `${this.state}, ${this.inputSymbol}, ${this.stackSymbol}`;
      const right = `${this.nextState}, ${this.pushToStack.join("")}`;
      return `(${left}) -> (${right})`;
    }
  };
}

function PushdownAutomaton(
  states, // A
  inputAlphabet, // X
  stackAlphabet, // Y
  transitionRelation, // f
  startState, // a0
  initialStackSymbol, // Z0
  acceptingStates, // F
  endWithEmptyStack = false
) {
  return {
    states,
    inputAlphabet,
    stackAlphabet,
    transitionRelation,
    startState,
    initialStackSymbol,
    acceptingStates,
    endWithEmptyStack,

    stack: [initialStackSymbol],
    state: startState,
    next(inputSymbol) {
      if (!this.inputAlphabet.includes(inputSymbol)) {
        throw new Error("Input symbol is not exist in input alphabet");
      }
    },
    toString() {
      const statesString = `{ ${this.states.join(", ")} }`;
      const inputAlphabetString = `{ ${this.inputAlphabet.join(", ")} }`;
      const stackAlphabetString = `{ ${this.stackAlphabet.join(", ")} }`;

      const relationString = this.transitionRelation.join("\n");

      const startStateString = startState.toString();
      const initialStackSymbolString = initialStackSymbol.toString();
      const acceptingStatesString = `{ ${acceptingStates.join(", ")} }`;

      return `
A = ${statesString}
X = ${inputAlphabetString}
Y = ${stackAlphabetString}

f:
${relationString}

start: ${startStateString}
stack: ${initialStackSymbolString}
accepting: ${acceptingStatesString}
      `;
    }
  };
}

function ContextFreeGrammar(
  nonterminalsSet,
  terminalsSet,
  startSymbol,
  relation
) {
  return {
    buildPushdownAutomaton() {
      const Z0 = "Z0";

      const a0 = "a0"; // initial state
      const a1 = "a1"; // main state
      const aFin = "a*"; // final state

      const states = [a0, a1, aFin];

      const inputAlphabet = [...nonterminalsSet];
      const stackAlphabet = [...terminalsSet, Z0];
      const transitionRelation = [
        TransitionRelation(a0, null, Z0, a1, [startSymbol, Z0]),
        TransitionRelation(a1, null, Z0, aFin, [Z0])
      ];

      const startState = startSymbol;
      const initialStackSymbol = Z0;
      const acceptingStates = [aFin];

      for (let transition of relation) {
        transitionRelation.push(
          TransitionRelation(
            a1,
            transition.outputSymbolList[0],
            transition.inputSymbol,
            a1,
            transition.outputSymbolList.slice(1)
          )
        );
      }

      return PushdownAutomaton(
        states,
        inputAlphabet,
        stackAlphabet,
        transitionRelation,
        startState,
        initialStackSymbol,
        acceptingStates
      );
    },

    toString() {
      return `
Vt = { ${nonterminalsSet.join(", ")} }
Vh = { ${terminalsSet.join(", ")} }

start: ${startSymbol}

P: 
${relation.join("\n")}
`;
    }
  };
}

function GrammarRelation(inputSymbol, outputSymbolList) {
  return {
    inputSymbol,
    outputSymbolList,

    match(inputSymbol) {
      return inputSymbol === this.inputSymbol;
    },

    toString() {
      return `${this.inputSymbol} -> ${this.outputSymbolList.join("")}`;
    }
  };
}

function main() {
  const { x, y, z } = {
    x: "x",
    y: "y",
    z: "z"
  };

  const { q, A, B, C } = {
    q: "q",
    A: "A",
    B: "B",
    C: "C"
  };

  const Vt = [x, y, z]; // nonterminals
  const Vh = [q, A, B, C]; // terminals
  const startSymbol = q;
  const relations = [
    GrammarRelation(q, [x, A]),
    GrammarRelation(A, [x, A, B, C]),
    GrammarRelation(A, [y, B]),
    GrammarRelation(A, [x]),
    GrammarRelation(B, [y]),
    GrammarRelation(C, [z])
  ];

  const grammar = ContextFreeGrammar(Vt, Vh, startSymbol, relations);

  console.log("========== C-F GRAMMAR ============");
  console.log(grammar.toString());
  console.log("\n");

  const pdAutomaton = grammar.buildPushdownAutomaton();

  console.log("========== PD AUTOMATON ============");
  console.log(pdAutomaton.toString());
}

main();
