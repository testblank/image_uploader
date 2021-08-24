import * as React from 'react';
import CheckTable from './components/CheckTable';
import MultipleUploader from './components/MultipleUploader/index';
import { uploadApi, purgeApi } from './api/request';
import { Promise as BPromise } from 'bluebird';
// import { debounce } from 'lodash';
// import { hot } from 'react-hot-loader';

import Style from './ImageUploader.module.scss';
import DragAndDrop from './components/DragAndDrop';
import UploadingModal from './components/UploadingModal';
import Purge from './components/Purge';
import HeaderButton from './components/HeaderButton';

export enum PageType {
  UPLOAD = 0,
  PURGE,
  CHECK,
  AUTOCHECK,
}

export interface IImgInfo {
  url?: string;
  file?: File;
  bizType?: number;
  fileName?: string;
  contentType?: string;
}

export interface IImgUploadParams {
  path: string;
  biz_type: number;
  file_name: string;
  content_type: string;
}

interface IProps { }

interface IState {
  path: string;
  pageType: number;
  uploading: boolean;
  onErrorPopup: boolean;
  imageInfoList: IImgInfo[];
  imgResUrlList: string[];
  imgPurgeUrlList: string[];
}

class ImageUploader extends React.Component<IProps, IState> {
  public state: IState = {
    path: '',
    pageType: 0,
    uploading: false,
    onErrorPopup: false,
    imgResUrlList: [],
    imageInfoList: [],
    imgPurgeUrlList: []
  };

  private pathInput = React.createRef<HTMLDivElement>();
  private upload = React.createRef<HTMLDivElement>();
  private purge = React.createRef<HTMLDivElement>();
  private autocheck = React.createRef<HTMLDivElement>();
  private check = React.createRef<HTMLDivElement>();
  private purgeUrl: string = 'https://sinastorage.com/statics.ada.sina.com.cn/resource';
  private errorList: string[] = [];
  private errorRes: { error: boolean, msg: string, res: number } = { error: false, msg: '', res: 0 };

  public componentDidMount() {
    localStorage.setItem(
      'accessToken',
      '829a3deaf8faa0762acc392da1d05d62d4f81e9d'
    );
  }

  private handleImageList = (info: IImgInfo | string) => {
    let tempNameList: string[] = [];
    const tempInfo: IImgInfo = info as IImgInfo;
    const tempInfoName: string = tempInfo.fileName!;

    if (info === 'clear') {
      this.setState({ imageInfoList: [] });
    } else {
      for (const key in this.state.imageInfoList) {
        if (this.state.imageInfoList.hasOwnProperty(key)) {
          const element = this.state.imageInfoList[key];
          tempNameList.push(element.fileName!);
        }
      }

      if (tempNameList.indexOf(tempInfoName) === -1) {
        this.setState({
          imageInfoList: this.state.imageInfoList.concat(info as IImgInfo)
        });
      }
    }
  };

  private handlePath = (e: any) => {
    this.setState({ path: e.currentTarget!.value });
  };

  private handleAdd = (sort: string) => async (e: any) => {
    const { path } = this.state;

    if (path === '') {
      this.pathInput.current!.classList.add(Style.blink);
      setTimeout(() => {
        this.pathInput.current!.classList.remove(Style.blink);
      }, 300);
      return;
    }

    if (sort === 'multiple' && path !== '') {
      const callUploadApi = await this.callUploadApi();
      if (callUploadApi) {
        await purgeApi(this.state.imgPurgeUrlList);
      }
    }
  };

  private callUploadApi = async () => {
    const { imageInfoList, path } = this.state;
    let imgUploadParams: IImgUploadParams;

    const splitPath = path.split('/');
    let tempPath: string = '';
    for (const iterator of splitPath) {
      if (iterator.length) {
        tempPath += `/${iterator}`;
      }
    }
    const newPath = tempPath.slice(1, tempPath.length);
    this.setState({ uploading: true });

    const promiseList = imageInfoList.map(async (imgInfo: IImgInfo) => {
      imgUploadParams = {
        path: newPath as string,
        biz_type: imgInfo.bizType!,
        file_name: imgInfo.fileName!,
        content_type: imgInfo.contentType!
      };

      try {
        const imgRes = await uploadApi(imgUploadParams, imgInfo.file as File);
        if (imgRes.resSina.status === 201) {
          const pathAndName: string = imgRes.url.slice(
            imgRes.url.length - path.length - imgInfo.fileName!.length - 1,
            imgRes.url.length
          );
          this.setState({
            imgResUrlList: this.state.imgResUrlList.concat(imgRes.url),
            imgPurgeUrlList: this.state.imgPurgeUrlList.concat(
              `${this.purgeUrl}/${pathAndName}`
            )
          });
          return BPromise.resolve(true);
        }
      } catch (e) {
        console.error('File upload failed');
        this.errorList = [...this.errorList].concat(e.requestParam.file_name);
        if (this.state.imageInfoList.length === this.errorList.length) {
          this.errorRes = { ...e.res };
          this.setState({ uploading: false, imageInfoList: [], path: '', onErrorPopup: true });
        }
        return BPromise.reject(true);
      }

      console.log('this.errorList: ', this.errorList)
    });

    try {
      await BPromise.all(promiseList);
      this.setState({
        imageInfoList: [],
        path: '',
        uploading: false
      });
      return BPromise.resolve(true);
    } catch (error) {
      return BPromise.reject(true);
    }
  };

  private deleteList = (e: any) => {
    const fileName = e.currentTarget.parentNode.innerText;
    const tempFileName = fileName
      .slice(0, fileName.length - 2)
      .slice(3, fileName.length);
    const { imageInfoList } = this.state;

    let tempList: IImgInfo[] = [];

    for (const key in imageInfoList) {
      if (imageInfoList.hasOwnProperty(key)) {
        const element: IImgInfo = imageInfoList[key];
        if (element.fileName !== tempFileName) {
          tempList = tempList.concat(element);
        }
      }
    }

    this.setState({
      imageInfoList: tempList
    });
  };

  private handlePage = (pageType: number) => () => {
    switch (pageType) {
      case PageType.UPLOAD: this.setState({ pageType: PageType.UPLOAD }); break;
      case PageType.PURGE: this.setState({ pageType: PageType.PURGE }); break;
      case PageType.CHECK: this.setState({ pageType: PageType.CHECK }); break;
      case PageType.AUTOCHECK: this.setState({ pageType: PageType.AUTOCHECK }); break;
    }
  };

  private handlePurge = (urlList: string[]) => async () => {
    const exceptEmpty = urlList.filter((item: string) => {
      return item!;
    })
    await purgeApi(exceptEmpty);
  }

  private handleTable = (table: JSON) => {
    // console.log(table);
  }

  private handleMouseDown = (type: number) => () => {
    switch (type) {
      case PageType.UPLOAD: this.upload.current!.classList.add(Style.mouse_down); break;
      case PageType.PURGE: this.purge.current!.classList.add(Style.mouse_down); break;
      case PageType.CHECK: this.check.current!.classList.add(Style.mouse_down); break;
      case PageType.AUTOCHECK: this.autocheck.current!.classList.add(Style.mouse_down); break;
    }
  }

  private handleMouseUp = (type: number) => () => {
    switch (type) {
      case PageType.UPLOAD: this.upload.current!.classList.remove(Style.mouse_down); break;
      case PageType.PURGE: this.purge.current!.classList.remove(Style.mouse_down); break;
      case PageType.CHECK: this.check.current!.classList.remove(Style.mouse_down); break;
      case PageType.AUTOCHECK: this.autocheck.current!.classList.remove(Style.mouse_down); break;
    }
  }

  private bodyRender = () => {
    const {
      path,
      pageType,
      uploading,
      imageInfoList,
      imgResUrlList,
    } = this.state;

    if (pageType === PageType.UPLOAD) {
      return (
        <>
          <div className={Style.dragWrap}>
            <p className={Style.paragragh}>
              <span role={'img'} aria-label={'right'}>
                👉
              </span>
              &nbsp;&nbsp; PLEASE DROP OR SELECT IMAGES LESS THEN 2MB
              <br />
              <span role={'img'} aria-label={'right'}>
                👉
              </span>
              &nbsp;&nbsp; U CAN SKIP FIRST SLASH FOR PATH
            </p>

            {uploading && <UploadingModal />}

            <div className={Style.inputWrap} ref={this.pathInput}>
              <span className={Style.text}>PATH: </span>
              <input
                className={Style.path_input}
                type="text"
                value={path}
                placeholder={'PLEASE ENTER PATH'}
                onChange={this.handlePath}
                required
              />
              <div
                onClick={this.handleAdd('multiple')}
                className={Style.addBtn}
              >
                UPLOAD
              </div>
            </div>

            <br />

            <div className={Style.dragZone}>
              <DragAndDrop handleImageList={this.handleImageList} sort={'image'} />
            </div>

            <div className={Style.btnZone}>
              <MultipleUploader handleImageList={this.handleImageList} />
              <div className={Style.listbox}>
                {imageInfoList.map((imageInfo: IImgInfo, index: number) => (
                  <div
                    key={`${imageInfo.fileName}_index_${index}`}
                    className={Style.fileName}
                  >
                    <span
                      style={{ marginRight: '0.5rem' }}
                      role={'img'}
                      aria-label={''}
                    >
                      📎
                    </span>
                    {imageInfo.fileName}
                    <span
                      className={Style.delBtn}
                      onClick={this.deleteList}
                      role={'img'}
                      aria-label={''}
                    >
                      ❌
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ol className={Style.ol}>
            {imgResUrlList.map((url: string, index: number) => (
              <li className={Style.li} key={`${url}_index_${index}`}>
                <a href={url}
                  // target={'_sub'}
                  target={'_blank'}
                >
                  {url}
                </a>
              </li>
            ))}
          </ol>
        </>
      )
    }
    if (pageType === PageType.PURGE) {
      return (
        <div className={Style.dragWrap}>
          <Purge purgeUrl={this.purgeUrl} handlePurge={this.handlePurge} />
        </div>
      )
    }
    if (pageType === PageType.CHECK) {
      return (
        <div className={Style.dragZone}>
          <DragAndDrop handleTable={this.handleTable} sort={'json'} />
        </div>
      )
    }
    if (pageType === PageType.AUTOCHECK) {
      return (
        <CheckTable />
      )
    }
  }

  private headerRender = () => {
    const { pageType } = this.state;
    return (
      <div className={Style.header}>
        <HeaderButton
          title={'UPLOAD IMAGES'}
          className={pageType === PageType.UPLOAD
            ? [Style.column_btn, Style.checked].join(' ')
            : Style.column_btn}
          handlePage={this.handlePage(PageType.UPLOAD)}
          handleMouseUp={this.handleMouseUp(PageType.UPLOAD)}
          handleMouseDown={this.handleMouseDown(PageType.UPLOAD)}
          ref={this.upload}
        />
        {/* <div
          className={
            pageType === PageType.UPLOAD
              ? [Style.column_btn, Style.checked].join(' ')
              : Style.column_btn
          }
          onClick={this.handlePage(PageType.UPLOAD)}
          onMouseUp={this.handleMouseUp(PageType.UPLOAD)}
          onMouseDown={this.handleMouseDown(PageType.UPLOAD)}
          ref={this.upload}
        >
          UPLOAD IMAGES
        </div> */}
        <div
          className={
            pageType === PageType.PURGE
              ? [Style.column_btn, Style.checked].join(' ')
              : Style.column_btn
          }
          onClick={this.handlePage(PageType.PURGE)}
          onMouseUp={this.handleMouseUp(PageType.PURGE)}
          onMouseDown={this.handleMouseDown(PageType.PURGE)}
          ref={this.purge}
        >
          PURGE IMAGES
        </div>
        <div
          className={
            pageType === PageType.AUTOCHECK
              ? [Style.column_btn, Style.checked].join(' ')
              : Style.column_btn
          }
          onClick={this.handlePage(PageType.AUTOCHECK)}
          onMouseUp={this.handleMouseUp(PageType.AUTOCHECK)}
          onMouseDown={this.handleMouseDown(PageType.AUTOCHECK)}
          ref={this.autocheck}
        >
          CHECK TABLE
        </div>
        <div
          className={
            pageType === PageType.CHECK
              ? [Style.column_btn, Style.checked].join(' ')
              : Style.column_btn
          }
          onClick={this.handlePage(PageType.CHECK)}
          onMouseUp={this.handleMouseUp(PageType.CHECK)}
          onMouseDown={this.handleMouseDown(PageType.CHECK)}
          ref={this.check}
        >
          CHECK ASSETS
        </div>
      </div>
    )
  }

  private renderErrorPopup = () => {
    const { errorList, errorRes } = this;
    return (
      <div className={Style.popup_wrap}>
        {/* <div className={Style.popup_filter} /> */}
        <div className={Style.popup_main}>
          <div className={Style.popup_close} onClick={this.onClickPopupClose}>X</div>
          <span>{`${errorRes.res}: ${errorRes.msg}`}</span>
          <span>failed upload file list</span>
          <ul>
            {errorList.map((fileName: string) => <li key={fileName}>{'>  '}{fileName}</li>)}
          </ul>
        </div>
      </div>
    )
  }

  private onClickPopupClose = () => {
    this.setState({ onErrorPopup: false })
    this.errorList = [];
  }

  private shareTest = async () => {
    let blob: Blob;
    let file: File;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://fashionintech.synology.me/share/dev_kor/webresource/UIResource/Lookbook/Lookbook_Look_Img/look_img_11000002_4.jpg');
    xhr.responseType = 'blob';

    xhr.onload = async () => {
      blob = xhr.response;
      file = new File([blob], 'testImageName', { type: 'image/jpeg' });
      console.log('파일')

      const newNav: any = window.navigator;

      if (newNav && newNav.share) {
        try {
          await newNav.share({
            title: 'test image share',
            files: file,
            // url: 'https://fashionintech.synology.me/share/dev_kor/webresource/UIResource/Lookbook/Lookbook_Look_Img/look_img_11000002_4.jpg'
          });
          console.log('success');
        }
        catch (error) {
          console.log(error);
        }
      }
    };

    xhr.send();
  }

  public render() {
    const { onErrorPopup } = this.state;

    return (
      <>
        <div className={onErrorPopup ? [Style.wrap, Style.blur].join(' ') : Style.wrap}>
          <span className={Style.version}>ver 1.6.1</span>
          {this.headerRender()}
          {this.bodyRender()}
        </div>
        {/* <div onClick={this.shareTest} style={{ width: '700px', height: '200px', background: 'white', color: 'red' }}>
          클릭
        </div> */}
        {this.state.onErrorPopup && this.renderErrorPopup()}
      </>
    );
  }
}

// export default hot(module)(ImageUploader);
export default ImageUploader;