import React from 'react';
import { Button, Icon } from 'antd';
import { IImgInfo } from '../../ImageUploader';
import Style from './index.module.scss';

interface IProps {
  url?: string;
  fileName?: string;
  handleImage?: (info: IImgInfo) => void;
}

export default class SingleUploader extends React.Component<IProps> {

  private input = React.createRef<HTMLInputElement>();
  private nameSpan = React.createRef<HTMLSpanElement>();


  private handleChange = (e: any) => {
    const reader = new FileReader();
    let imgInfo: IImgInfo;

    if (this.input.current!.files && this.input.current!.files[0]) {
      const file = this.input.current!.files[0];
      const fileName = this.input.current!.files[0].name;
      const contentType = this.input.current!.files[0].type;

      reader.onload = (event: any) => {
        const { result } = event.currentTarget;
        imgInfo = {
          url: result,
          bizType: 7,
          fileName,
          contentType,
          file,
        };

        this.props.handleImage!(imgInfo);
      };
      reader.readAsDataURL(this.input.current!.files[0]);
    }
  };

  private handleFile = (sort: string) => {
    if (sort === 'cover_image_addr') {
      this.input.current!.click();
    }
  };

  private handleCancel = () => {
    const imgInfo: IImgInfo = {
      bizType: 7,
      fileName: '',
      contentType: '',
      url: '',
    };
    this.props.handleImage!(imgInfo);
  };

  public render() {
    const { url, fileName } = this.props;
    const { handleChange, handleCancel } = this;
    return (
      <>
        <input
          type='file'
          accept='.jpg, .jpeg, .png'
          onChange={handleChange}
          ref={this.input}
          style={{ display: 'none' }}
        />
        <Button onClick={() => this.handleFile('cover_image_addr')}>
          <Icon type={'upload'} /> Singe Image Upload
        </Button>
        {url !== '' && url !== null && url !== undefined &&
          <>
            <div className={Style.preview}>
              <img src={url} alt={''} />
            </div>
            <div className={Style.filename} style={{ width: '312px' }}>
              <Icon type='paper-clip' />
              <span ref={this.nameSpan} className={Style.filename_txt}>
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
