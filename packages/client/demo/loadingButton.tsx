import * as React from 'react';
import { Button } from 'antd';

interface LoadingButtonProps {
    icon: string;
    onClick: (e: any) => any;
    onLoaded?: (data: any) => void;
}

interface LoadingButtonState {
    isLoading: boolean;
}

export default class LoadingButton extends React.Component<LoadingButtonProps, LoadingButtonState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }
    public render() {
        return (
            <Button
                icon={this.props.icon}
                shape="circle"
                loading={this.state.isLoading}
                onClick={async (e: any) => {
                    this.setState({
                        isLoading: true,
                    });
                    const response = await this.props.onClick(e);
                    this.setState({
                        isLoading: false,
                    });
                    if (response !== undefined && this.props.onLoaded) {
                        this.props.onLoaded(response);
                    }
                }}
            />
        );
    }
}
