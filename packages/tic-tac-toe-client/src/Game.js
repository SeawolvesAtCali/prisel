import React from 'react';
import Container from './Container';
import Context from './context';

const indice = [0, 1, 2, 3, 4, 5, 6, 7, 8];
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: {},
        };
    }

    render() {
        return (
            <Container title="tic-tac-toe">
                <Context.Consumer>
                    {(context) => {
                        if (!context.gameState) {
                            return null;
                        }
                        const { gameState, id } = context;
                        const isMyTurn = gameState.player[gameState.currentPlayer] === id;
                        const gameBoard = gameState.map;
                        return (
                            <React.Fragment>
                                <h3>{isMyTurn ? 'Your turn' : "Opponent's turn"}</h3>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gridTemplateRows: 'repeat(3, 1fr)',
                                        columnGap: '2px',
                                        rowGap: '2px',
                                        height: '233px',
                                    }}
                                >
                                    {indice.map((index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                fontSize: '40px',
                                                background: '#f1f1f1',
                                                border:
                                                    this.props.value === index
                                                        ? '1px solid red'
                                                        : 'none',
                                            }}
                                            onClick={() => this.props.onMove(index)}
                                        >
                                            {gameBoard[index]}
                                        </div>
                                    ))}
                                </div>
                            </React.Fragment>
                        );
                    }}
                </Context.Consumer>
            </Container>
        );
    }
}

export default Game;
