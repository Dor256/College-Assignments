function promptForNumber() {
  const number = prompt("Enter a number greater or equal to 3");
  if (number === null) {
    return promptForNumber();
  } else if (number < 3) {
    alert("That number is lower than 3!");
    return promptForNumber();
  }
  return number;
}

function createSpiralMatrix(n) {
  let matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  let counter = 1;
  let initialCol = 0;
  let initialRow = 0;
  let finalCol = n - 1;
  let finalRow = n - 1;
  while (initialCol <= finalCol && initialRow <= finalRow) {
    for (let i = initialCol; i <= finalCol; i++) {
      matrix[initialRow][i] = counter;
      counter++;
    }
    initialRow++;

    for (let i = initialRow; i <= finalRow; i++) {
      matrix[i][finalCol] = counter;
      counter++;
    }
    finalCol--;

    for (let i = finalCol; i >= initialCol; i--) {
      matrix[finalRow][i] = counter;
      counter++;
    }
    finalRow--;

    for (let i = finalRow; i >= initialRow; i--) {
      matrix[i][initialCol] = counter;
      counter++;
    }
    initialCol++;

  }
  return matrix;
}

function createRootElement() {
  const rootElement = document.createElement('table');
  rootElement.id = 'root';
  rootElement.width = 500;
  document.body.prepend(rootElement);
  return rootElement;
}

function drawMatrix(matrix) {
  const rootElement = createRootElement();
  matrix.map((row) => {
    const tableRow = document.createElement('tr');
    rootElement.appendChild(tableRow);
    row.map((number) => {
      const cell = document.createElement('td');
      cell.className = 'cell'
      cell.textContent = number;
      cell.align = 'center';
      cell.width = '50vw';
      cell.height = '50vh';
      tableRow.appendChild(cell);
    });
  });
}

const input = promptForNumber();
const matrix = createSpiralMatrix(input);
drawMatrix(matrix);
