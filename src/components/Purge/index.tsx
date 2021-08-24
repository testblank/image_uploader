import * as React from 'react';

import Style from './index.module.scss';

interface IProps {
  purgeUrl: string;
  handlePurge: (urlList: string[]) => () => void;
}

interface IState {
  inputIndexList: number[];
  imgPurgeUrlList: string[];
}

export default class Purge extends React.Component<IProps, IState> {
  public state = {
    inputIndexList: [],
    imgPurgeUrlList: []
  };

  private index: number = 0;
  private indexArray: number[] = [];
  private urlArray: string[] = [];
  private inputElem = React.createRef<HTMLInputElement>();

  public componentDidMount() {
    this.indexArray.push(this.index);
    ++this.index;
    this.setState({
      inputIndexList: this.indexArray
    });
  };

  private handleAddInput = () => {
    this.indexArray.push(this.index);
    ++this.index;
    this.setState({
      inputIndexList: this.indexArray
    });
  };

  private handleInput = (index: number) => {
    this.urlArray[index] = this.inputElem.current?.value as string;
    this.setState({
      imgPurgeUrlList: this.urlArray
    });
  };

  public render(): JSX.Element {
    const { purgeUrl, handlePurge } = this.props;
    const { imgPurgeUrlList, inputIndexList } = this.state;
    
    return (
      <div className={Style.purge_wrap}>
        <div className={Style.btn_wrap}>
          <div onClick={handlePurge(imgPurgeUrlList)} className={Style.purge_btn}>
            PURGE ALL!
          </div>
        </div>
        {inputIndexList.length &&
          inputIndexList.map((item: number, index: number) => (
            <div key={`${item}_${index}`} style={{ marginBottom: '1rem', width: '100%' }}>
              <div className={Style.input_wrap}>
                <div onClick={this.handleAddInput} className={Style.add_btn}>+</div>
                <input
                  ref={this.inputElem}
                  type="text"
                  onChange={() => this.handleInput(index)}
                  placeholder={'PLEASE ENTER PATH ex) UI_ASSETS/cat.jpg'}
                  required
                />
              </div>
              <div className={Style.preview_url}>
                미리보기 url:
                <a
                  style={{ color: 'white' }}
                  target={'_blank'}
                  // href={`${purgeUrl}/${imgPurgeUrlList[index]}`}
                >
                  {/* {purgeUrl}/{imgPurgeUrlList[index]} */}
                </a>
              </div>
            </div>
          ))}
      </div>
    );
  }
}
