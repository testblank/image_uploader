import React from 'react';
import { IImgInfo } from '../../ImageUploader';
import ImageComp from '../ImageComp';
import NoImage from '../../res/no_image.png';
import Style from './index.module.scss';

interface IProps {
  sort: string;
  handleImageList?: (info: IImgInfo | string) => void;
  handleTable?: (table: JSON) => void;
}

interface IState {
  sort: string;
  drag: boolean;
  path: string;
  table: any[];
  format: string;
  server: string;
  dragging: boolean;
  tableName: string;
  valueArray: string[];
}

export default class DragAndDrop extends React.Component<IProps, IState> {
  public state = {
    sort: 'image',
    drag: true,
    path: '',
    table: [],
    format: 'jpg',
    server: 'nas',
    dragging: false,
    tableName: '',
    valueArray: [],
  }

  private dropRef = React.createRef<HTMLDivElement>();
  private dragCounter: number = 0;
  private r = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    this.setState({ sort: this.props.sort })
    this.dragCounter = 0;
    let div = this.dropRef.current!;
    div.addEventListener('dragenter', this.handleDragIn);
    div.addEventListener('dragleave', this.handleDragOut);
    div.addEventListener('dragover', this.handleDrag);
    div.addEventListener('drop', this.handleDrop);
  }

  public componentWillUnmount() {
    let div = this.dropRef.current!;
    div.removeEventListener('dragenter', this.handleDragIn);
    div.removeEventListener('dragleave', this.handleDragOut);
    div.removeEventListener('dragover', this.handleDrag);
    div.removeEventListener('drop', this.handleDrop);
  }

  private handleDragIn = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    this.dragCounter++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true })
    }
  }

  private handleDragOut = (e: any) => {
    e.preventDefault()
    e.stopPropagation()

    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.setState({ dragging: false })
    }
  }

  private handleDrag = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
  }

  private traverseFileTree = (item: any) => {
    if (item.isDirectory) {
      const dirReader = item.createReader();
      dirReader.readEntries((entries: any) => {
        for (const iterator of entries) {
          this.traverseFileTree(iterator);
        }
      })
    }
    else if (item.isFile) {
      let imgInfo: IImgInfo;
      item.file((file: File) => {
        const reader: FileReader = new FileReader();
        const contentType = file.type;
        const splitByDotList = file.name.split('.');
        const fileName = `${splitByDotList[0]}.${splitByDotList[1].toLowerCase()}`;

        if (file.size > 2097152) {
          alert(`${file.name}'s size is bigger than 2MB`);
          return;
        }
        else if (splitByDotList.length > 2) {
          alert('dot in filename restricted');
          return;
        }
        else {
          reader.onload = (e: any) => {
            imgInfo = {
              url: e.currentTarget.result,
              bizType: 7,
              fileName,
              contentType,
              file,
            }
            this.props.handleImageList!(imgInfo);
          }
          reader.readAsDataURL(file);
        }
        return null;
      })
    }
  };

  private handleDrop = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const { sort } = this.state;
    this.setState({ drag: false, dragging: false });

    if (sort === 'json' && e.dataTransfer.files[0].type.match('application/json')) {
      const file = e.dataTransfer.files[0];
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const table = JSON.parse(e.currentTarget!.result);
        this.setState({ table, tableName: file.name })
      }
      reader.readAsText(file)

    }
    else if (sort === 'image' && e.dataTransfer.items && !e.dataTransfer.files[0].type.match('application/json')) {
      const items = e.dataTransfer.items;

      for (const iterator of items) {
        const item = iterator.webkitGetAsEntry();
        this.traverseFileTree(item);
      }

      e.dataTransfer.clearData()
      this.dragCounter = 0
    }
    else {
      return;
    }
  }

  private handleSelect = (e: any) => {
    const { table } = this.state;
    const keyValue = e.currentTarget!.value;
    let valueArray: string[] = [];

    for (const iterator of table) {
      const value = iterator[keyValue];
      valueArray.push(value);
    }

    this.setState({ valueArray })

    // !sina cloud
    // !https://sinastorage.com/statics.ada.sina.com.cn/resource/${path}/${filename}.png(.jpg.jpeg)
    // !https://fashionintech.synology.me/share/dev_kor/webresource/${path}/${filename}.png(.jpg.jpeg)
    // !
  }

  private handleInput = (e: any) => {
    const path = e.currentTarget!.value;
    this.setState({ path });
  }
  private listRender = () => {
    const { server, valueArray, path, format } = this.state;
    const sinaUrl = 'https://sinastorage.com/statics.ada.sina.com.cn/resource/';
    const nasUrl = 'https://fashionintech.synology.me/share/dev_kor/webresource/';
    let src: string;
    const noImage = NoImage;
    // const noImage = 'https://cdn4.iconfinder.com/data/icons/ui-beast-4/32/Ui-12-512.png';

    // ! UIResource/challenge_cover
    if (valueArray.length !== 0 && format !== '') {
      if (server === 'sina') {
        src = `${sinaUrl}${path}/`;
      }
      else {
        src = `${nasUrl}${path}/`;
      }
      return (
        valueArray.map((value: string, index: number) => (
          <div className={Style.list} key={`${value}_${index}`}>
            <div className={Style.value}>{value}</div>
            <div className={Style.img} ref={this.r}>
              <ImageComp src={`${src}${value}.${format}`} fallbackSrc={noImage} />
            </div>
          </div>
        ))
      )
    }
    else {
      if (server === 'sina') {
        src = `${sinaUrl}${path}`;
      }
      else {
        src = `${nasUrl}${path}`;
      }
      console.log(src);
      return (
        <div className={Style.list}>
          <div className={Style.value}>{path}</div>
          <div className={Style.img} ref={this.r}>
            <ImageComp src={`${src}.${format}`} fallbackSrc={noImage} />
          </div>
        </div>
      )
    }
  }

  private handleFormat = (e: any) => {
    const value = e.currentTarget!.value;
    this.setState({
      format: value,
    })
  }

  private handleServer = (e: any) => {
    const value = e.currentTarget!.value;
    this.setState({
      server: value,
    })
  }

  public render() {
    const { sort, path, table, tableName } = this.state;
    const keys = table.length && Object.keys(table[0]);

    if (sort === 'image') {
      return (
        <div className={Style.wrap} ref={this.dropRef}>
          {this.state.dragging
            ?
            <div className={Style.cover}>
              <div className={Style.inner}>
                <div className={Style.inner_text}>
                  <span role={'img'} aria-label={'bear'}>🧸</span>
                </div>
              </div>
            </div>
            : <div className={[Style.init, Style.no_drag].join(' ')}>DROP IMAGES</div>
          }
        </div>
      )
    }
    if (sort === 'json') {
      return (
        <div className={Style.wrap} ref={this.dropRef} style={{ color: 'white' }}>
          {this.state.dragging
            ?
            <div className={Style.cover}>
              <div className={Style.inner}>
                <div className={Style.inner_text}>DROP</div>
              </div>
            </div>
            : <div className={[Style.init, Style.no_drag].join(' ')}>PLEASE DROP TABLE HERE</div>
          }
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '1.25rem', color: '#6F7277' }}>UPLOADED TABLE:
              <span style={{ textDecoration: 'underline' }}>
                {` ${tableName}`}
              </span>
            </div>
            <br />
            <div>{'sinaUrl: https://sinastorage.com/statics.ada.sina.com.cn/resource/'}<span style={{ color: 'yellow' }}>{'{path}'}</span><span>/</span><span style={{ color: 'yellow' }}>{'{filename}'}</span></div>
            <div>{'nasUrl : https://fashionintech.synology.me/share/dev_kor/webresource/'}<span style={{ color: 'yellow' }}>{'{path}'}</span><span>/</span><span style={{ color: 'yellow' }}>{'{filename}'}</span></div>
          </div>
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between'
          }}>
            <div className={Style.select_box}>
              <div className={Style.select_elem}>
                <select name="" id="" onChange={this.handleFormat} defaultValue={'jpg'}>
                  <option value="jpg">jpg</option>
                  <option value="png">png</option>
                  <option value="jpeg">jpeg</option>
                  <option value="svg">svg</option>
                </select>
                <select name="" id="" onChange={this.handleServer} defaultValue={'nas'}>
                  <option value="nas">nas</option>
                  <option value="sina">sina</option>
                </select>
                <select name={tableName} onChange={this.handleSelect} defaultValue={''}>
                  {
                    tableName
                      ? <option value={''} disabled>key 값을 선택하세요</option>
                      : <option value={''} disabled>table 을 업로드 하세요</option>
                  }
                  {
                    keys && keys.map((key: string) => (
                      <option value={key} key={key}>{key}</option>
                    ))
                  }
                </select>
                <div className={Style.path_input}>
                  <span style={{ color: 'white' }}>path: </span><input type="text" onChange={this.handleInput} value={path} />
                </div>
                <div style={{ color: 'white', marginTop: '10px' }}>
                  개별 파일도 검색 가능합니다.
                  <br />
                  ex) 셀렉트박스에서 <span style={{ color: 'yellow' }}>포멧</span>과 <span style={{ color: 'yellow' }}>클라우드</span> 위치 선택 후
                  <br />
                  <span style={{ color: 'yellow' }}>path</span> 에 <span style={{ color: 'yellow' }}>UIResource/challenge_icon/icn_classbadge_c</span> 입력(파일명 까지)
                </div>
              </div>
            </div>
          </div>
          <div className={Style.list_wrap}>
            {path !== '' && this.listRender()}
          </div>
        </div>
      )
    }
  }
}