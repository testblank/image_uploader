import React from 'react';
import { Button, Icon } from 'antd';
import { IImgInfo } from '../../ImageUploader';
import Style from './index.module.scss';

interface IProps {
  url?: string;
  fileName?: string;
  handleImageList?: (info: IImgInfo | string) => void;
}

export default class MultipleUploader extends React.Component<IProps> {

  private input = React.createRef<HTMLInputElement>();
  private nameSpan = React.createRef<HTMLSpanElement>();


  private handleChange = () => {
    const files = this.input.current!.files!;
    let imgInfo: IImgInfo;

    Array.from(files).map((file: File) => {
      const reader: FileReader = new FileReader();
      const contentType = file.type;
      const splitByDotList = file.name.split('.');
      const fileName = `${splitByDotList[0]}.${splitByDotList[1].toLowerCase()}`;

      if (file.size > 2097152) {
        alert(`${file.name}'s size is bigger than 2MB`);
      }
      else if (splitByDotList.length > 2) {
        alert('dot in filename restricted');
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
    this.input.current!.value = '';
  };

  private handleFile = (sort: string) => {
    if (sort === 'cover_image_addr') {
      this.input.current!.click();
    }
  };

  private handleCancel = () => {
    this.props.handleImageList!('clear');
  };

  public render() {
    const { url, fileName } = this.props;
    const { handleChange, handleCancel } = this;
    return (
      <>
        <input
          id='uploadCaptureInputFile'
          type='file'
          accept='.jpg, .jpeg, .png'
          onChange={handleChange}
          ref={this.input}
          style={{ display: 'none' }}
          multiple
        />
        <Button onClick={() => this.handleFile('cover_image_addr')} style={{
          color: 'white',
          background: '#646464',
          border: 'none',
          height: '2rem',
          width: '100%'
        }}>
          {/* <Icon type={'upload'} /> SELECT IMAGES */}
          SELECT IMAGES
        </Button>
        {url !== '' && url !== null && url !== undefined &&
          <>
            <div className={Style.preview}>
              <img
                src={url} alt={''}
              />
            </div>
            <div className={Style.filename} style={{ width: '312px' }}>
              <span ref={this.nameSpan} className={Style.filename_txt} role={'img'} aria-label={''}>
                📎
                {
                  fileName
                    ? fileName
                    : url
                }
              </span>
              <Icon type='close' onClick={handleCancel} />
            </div>
          </>
        }
      </>
    );
  }
}
