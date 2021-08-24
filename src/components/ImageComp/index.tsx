import React from 'react';

import Style from './index.module.scss';

interface IProps {
  src: string;
  fallbackSrc: string;
}

interface IState {
  src: string;
  loading: boolean;
  fallbackSrc: string;
}

export default class ImageComp extends React.Component<IProps, IState> {
  public state = {
    src: this.props.src,
    loading: true,
    fallbackSrc: this.props.fallbackSrc,
  };

  private onError = () => {
    if (this.state.src !== this.props.fallbackSrc) {
      this.setState({
        src: this.props.fallbackSrc,
      });
    }
  }

  private onLoad = () => {
    this.setState({
      loading: false,
    })
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (this.props.src !== prevProps.src) {
      this.setState({
        ...this.state,
        src: this.props.src,
      })
    }
  }

  public render() {
    const { src, loading } = this.state;
    const {
      src: _1,
      fallbackSrc: _2,
      ...props
    } = this.props;

    return (
      <>
        <img
          alt={''}
          src={src}
          onLoad={this.onLoad}
          onError={this.onError}
          {...props}
          style={
            loading
              ? { display: 'none' }
              : undefined
          }
        />
        {loading && <div className={Style.loader}>Loading...</div>}
      </>
    );
  }
}