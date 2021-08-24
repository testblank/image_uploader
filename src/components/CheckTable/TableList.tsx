import React from 'react';
import ImageComp from '../ImageComp';
import RadioGroup from '../RadioGroup';
import NoImage from '../../res/no_image.png';
import Style from './TableList.module.scss';

export interface ITableListInfo {
  [tableName: string]: ITableInfo;
}

export interface ITableInfo {
  [key: string]: {
    path: string;
    format: string;
    value: string[];
  }
}

interface IProps {
  table: any[];
  tableName: string;
}

interface IState {
  keyList: string[];
  langList: string[];
  multiple: boolean;
  tableList: ITableListInfo;
  tableName: string;
  currentKey: string;
  currentLang: string;
  currentMultiple: string;
  droppedTableInfo: ITableInfo;
}

export default class TableList extends React.Component<IProps, IState> {
  static defaultProps = {
    table: [],
    tableName: '',
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      keyList: [],
      langList: [
        'kr',
        'cn',
      ],
      multiple: false,
      tableList: require('../../res/tableData.json'),
      tableName: '',
      currentKey: '',
      currentLang: 'kr',
      currentMultiple: '',
      droppedTableInfo: {},
    };
  }

  public componentDidMount() {
    const { table, tableName } = this.props;
    const { tableList } = this.state;
    const droppedTable = tableList[tableName];
    let multiple: boolean = false;
    let currentMultiple = '';

    // ! 배수있는 이미지 작성해주기.
    if (
      tableName === 'RandomBoxTableXlsTblAsset.json'
      || tableName === 'ContentsGuideTableXlsTblAsset.json'
      || tableName === 'AdaRunwayTableXlsTblAsset.json'
    ) {
      multiple = true;
      currentMultiple = '@1x';
    }
    
    if (droppedTable !== undefined) {
      const droppedTableInfo = tableList[tableName];
      const keyList = Object.keys(droppedTableInfo);
      
      for (const key of keyList) {
        for (const iterator of table) {
          droppedTableInfo[key].value.push(iterator[key]);
        }
      }
      
      this.setState({
        keyList,
        multiple,
        tableName,
        currentKey: keyList[0],
        currentMultiple,
        droppedTableInfo,
      })
    }
    else {
      this.setState({
        keyList: [],
        multiple,
        tableName,
        currentMultiple,
        droppedTableInfo: {},
      })
      return;
    }
  }

  public componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (prevProps.table !== this.props.table) {
      this.componentDidMount();
    }
  }

  private handleClick = (value: string, type: string) => {
    switch (type) {
      case 'lang': this.setState({ currentLang: value }); break;
      case 'key': this.setState({ currentKey: value }); break;
      case 'multi': this.setState({ currentMultiple: value }); break;
    }

  }

  private listRender = () => {
    const { tableName, droppedTableInfo, currentLang, currentKey, currentMultiple } = this.state;
    const nasUrl = 'https://fashionintech.synology.me/share/dev_kor/webresource/UIResource/';
    const sinaUrl = 'https://sinastorage.com/statics.ada.sina.com.cn/resource/UIResource/';
    const noImage = NoImage;
    // const noImage = 'https://cdn4.iconfinder.com/data/icons/ui-beast-4/32/Ui-12-512.png';

    const lang = currentLang.toUpperCase();
    let multiple: string = '';

    switch (currentMultiple) {
      case '@1x': multiple = '@1x'; break;
      case '@2x': multiple = '@2x'; break;
      case '@3x': multiple = '@3x'; break;
      case '@4x': multiple = '@4x'; break;
      default: multiple = ''; break;
    }

    if (droppedTableInfo !== {}) {
      for (const key in droppedTableInfo) {
        if (droppedTableInfo.hasOwnProperty(key)) {
          const element = droppedTableInfo[currentKey];
          return (
            element.value.map((value: string, index: number) => (
              <div key={`${value}_${index}`} className={Style.imgs}>
                <div className={Style.value}>
                  {value}
                </div>
                <div className={Style.img}>
                  <ImageComp
                    src={
                      tableName === 'ContentsGuideTableXlsTblAsset.json'
                        ? `${nasUrl}${element.path}/${lang}_${value}${multiple}.${element.format}`
                        : `${nasUrl}${element.path}/${value}${multiple}.${element.format}`
                    }
                    fallbackSrc={noImage}
                  />
                  <a
                    target={'_blank'}
                    href={
                      tableName === 'ContentsGuideTableXlsTblAsset.json'
                        ? `${nasUrl}${element.path}/${lang}_${value}${multiple}.${element.format}`
                        : `${nasUrl}${element.path}/${value}${multiple}.${element.format}`
                    }>
                    {
                      tableName === 'ContentsGuideTableXlsTblAsset.json'
                        ? `${nasUrl}${element.path}/${lang}_${value}${multiple}.${element.format}`
                        : `${nasUrl}${element.path}/${value}${multiple}.${element.format}`
                    }
                  </a>
                </div>
                <div className={Style.img}>
                  <ImageComp
                    src={
                      tableName === 'ContentsGuideTableXlsTblAsset.json'
                        ? `${sinaUrl}${element.path}/${lang}_${value}${multiple}.${element.format}`
                        : `${sinaUrl}${element.path}/${value}${multiple}.${element.format}`
                    }
                    fallbackSrc={noImage}
                  />
                  <a
                    target={'_blank'}
                    href={
                      tableName === 'ContentsGuideTableXlsTblAsset.json'
                        ? `${sinaUrl}${element.path}/${lang}_${value}${multiple}.${element.format}`
                        : `${sinaUrl}${element.path}/${value}${multiple}.${element.format}`
                    }>
                    {
                      tableName === 'ContentsGuideTableXlsTblAsset.json'
                        ? `${sinaUrl}${element.path}/${lang}_${value}${multiple}.${element.format}`
                        : `${sinaUrl}${element.path}/${value}${multiple}.${element.format}`
                    }
                  </a>
                </div>
              </div>
            ))
          )
        }
      }
    }
  }

  public render() {
    const { keyList, tableName, langList, multiple, currentLang, currentKey, currentMultiple } = this.state;
    const multipleList: string[] = ['원본', '@1x', '@2x', '@3x', '@4x'];

    return (
      <div>
        <div className={Style.list}>
          {
            tableName === 'ContentsGuideTableXlsTblAsset.json'
              ? (<div className={Style.input_wrap}>
                {
                  langList.map((lang: string) => {
                    const checked = lang === currentLang ? true : false;
                    return (
                      <RadioGroup
                        key={lang}
                        value={lang}
                        checked={checked}
                        handleClick={() => this.handleClick(lang, 'lang')}
                      />
                    )
                  })
                }
              </div>)
              : (<div className={Style.input_wrap}>
                {
                  keyList.map((key: string) => {
                    const checked = key === currentKey ? true : false;
                    return (
                      <RadioGroup
                        key={key}
                        value={key}
                        checked={checked}
                        handleClick={() => this.handleClick(key, 'key')}
                      />
                    )
                  })
                }
              </div>)
          }
          {
            multiple && (
              <div className={Style.input_wrap} style={{ top: '50px' }}>
                {
                  multipleList.map((key: string) => {
                    const checked = key === currentMultiple ? true : false;
                    return (
                      <RadioGroup
                        key={key}
                        value={key}
                        checked={checked}
                        handleClick={() => this.handleClick(key, 'multi')}
                      />
                    )
                  })
                }
              </div>
            )
          }
          <div className={Style.header} style={multiple ? { top: '100px' } : {}}>
            <div>KEY</div>
            <div>NAS</div>
            <div>SINA</div>
          </div>
          {this.listRender()}
        </div>
      </div>
    )
  }
}