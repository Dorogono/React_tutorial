import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Square(props) {
  const backgroundColor = props.backgroundColor;
  const clickColor = props.clickColor;
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={{ backgroundColor, color: clickColor }}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const isWinningIdx =
      this.props.winner && this.props.winner.indexOf(i) !== -1;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        backgroundColor={isWinningIdx && "deepskyblue"}
        clickColor={this.props.clickBox === i && "red"}
      />
    );
  }

  render() {
    const borderRow = [];
    let k = 0;
    for (let i = 0; i < 3; i++) {
      const squares = [];
      for (let j = 0; j < 3; j++) {
        squares.push(this.renderSquare(3 * i + j));
        k++;
      }
      borderRow.push(
        <div key={k} className="board-row">
          {squares}
        </div>
      );
    }

    return <div>{borderRow}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAscending: true,
      history: [
        {
          squares: Array(9).fill(null),
          position: {
            row: null,
            col: null,
          },
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      clickBox: null,
    };
  }

  handleClick(i) {
    // 불변성을 위함
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          position: {
            row: parseInt(i / 3 + 1),
            col: (i % 3) + 1,
          },
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      clickBox: i,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  handleReverseToggle() {
    this.setState({
      isAscending: !this.state.isAscending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const isAscending = this.state.isAscending;

    const moves = history.map((step, move) => {
      const desc = move
        ? `Go to move #${move} :
          [${step.position.row}, ${step.position.col}]`
        : "Go to game start";

      return (
        <li key={move} value={move + 1}>
          <button
            onClick={() => this.jumpTo(move)}
            className={move === this.state.stepNumber ? "font-weight-bold" : ""}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner.player}`;
    } else if (!winner && this.state.stepNumber === current.squares.length) {
      status = "무승부";
    } else {
      status = `Next Player: ${this.state.xIsNext ? "X" : "O"}`;
    }

    if (!isAscending) moves.reverse();

    const reverseBtnText = isAscending ? "뒤집기" : "원래대로";
    const reverseBtn = (
      <button onClick={() => this.handleReverseToggle()}>
        {reverseBtnText}
      </button>
    );

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winner={winner && winner.winningIdx}
            clickBox={this.state.clickBox}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div>{reverseBtn}</div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        player: squares[a],
        winningIdx: [a, b, c],
      };
    }
  }

  return null;
}
