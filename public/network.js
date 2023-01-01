class NeuralNetwork {
  constructor(neuronCounts){
    this.levels=[];
    for(let i=0; i<neuronCounts.length - 1; i++) {
      this.levels.push(new Level(
        neuronCounts[i], neuronCounts[i+1]
      ));
    }
  }

  static feedForward(givenInputs, network) {
    let outputs = Level.feedForward(
      givenInputs, network.levels[0]
    );

    // put the output of previous level as input to next level
    for(let i=1; i < network.levels.length; i++) {
      outputs = Level.feedForward(
        outputs, network.levels[i]
      );
    }
    return outputs;
  }

  // 1 being 100%
  static mutate(network, amount=1) {
    network.levels.forEach(level => {
      for(let i=0; i<level.biases.length; i++) {
        level.biases[i] = lerp(
          level.biases[i],
          Math.random() * 2 - 1,
          amount
        )
      }
      for(let i=0; i<level.weights.length; i++) {
        for(let j=0; j<level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          )
        }
      }
    });
  }
}

class Level{
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];
    for(let i=0; i<inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level.#randomize(this);
  }

  static #randomize(level){
    for(let i = 0; i < level.inputs.length; i++){
      for(let j = 0; j < level.outputs.length; j++){
        // a value between -1 and 1
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for(let i = 0; i < level.biases.length; i++){
      level.biases[i]=Math.random() * 2 - 1;
    }
  }

  static tanh(x) {
    if (x === Infinity) {
      return 1;
    } else if (x === -Infinity) {
      return -1;
    } else {
      let e2x = Math.exp(2 * x);
      return (e2x - 1) / (e2x + 1);
    }
  }

  static dTanh(x) {
    let output = Level.tanh(x);
    return 1 - output * output;
  }

  static dSigmoid(x) {
    let output = Level.sigmoid(x);
    return output * (1 - output);
  }

  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  static relu(x) {
    return x => Math.max(0, x);
  }

  static dRelu(x) {
    return x <= 0 ? 0 : 1;
  }

  static linear(x) {
     return x;
  }

  static dLinear(x) {
    return 1;
  }

  static dact(value) {
    return Level.dSigmoid(value);
  }

  static act(value) {
    return Level.sigmoid(value);
  }

  // In theory we can use a different activation fn for the final output layer...
  static dOutputAct(value) {
    return Level.dSigmoid(value);
  }

  static outputAct(value) {
    return Level.sigmoid(value);
  }

  static feedForward(givenInputs,level) {
    for(let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for(let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for(let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      // consider using a different activation function for the output layer...

      //if (sum > level.biases[i]){
        //level.outputs[i] = 1;
        //level.outputs[i] = 0;
      let isFinalOutputLayer = i === level.outputs.length - 1;
      if (isFinalOutputLayer) {
        level.outputs[i] = Level.outputAct(sum + level.biases[i]);
      } else {
        level.outputs[i] = Level.act(sum + level.biases[i]);
      }
    }
    return level.outputs;
  }

}
