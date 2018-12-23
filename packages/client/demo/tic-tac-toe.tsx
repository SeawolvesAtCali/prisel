import * as React from 'react';
import { CustomFieldProps } from './clientContainer';
const indice = [0, 1, 2, 3, 4, 5, 6, 7, 8];
interface TicTacToeProps extends CustomFieldProps {
    onChange: (value: number) => void;
    value: number;
}
interface TicTacToeState {
    board: string[];
}
class TicTacToe extends React.Component<TicTacToeProps, TicTacToeState> {
    public state = {
        board: Array.from({ length: 8 }).map(() => ''),
    };
    private offEvent: () => void;
    public componentDidMount() {
        const { onEvent } = this.props;
        this.offEvent = onEvent((eventType: string, data: any) => {
            if (eventType === 'GAME_STATE') {
                this.setState({
                    board: data.map,
                });
            }
        });
    }
    public componentWillUnmount() {
        this.offEvent();
        this.offEvent = undefined;
    }
    public render() {
        return (
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
                            border: this.props.value === index ? '1px solid red' : 'none',
                        }}
                        onClick={() => this.props.onChange(index)}
                    >
                        {this.state.board[index]}
                    </div>
                ))}
            </div>
        );
    }
}

export default TicTacToe;
