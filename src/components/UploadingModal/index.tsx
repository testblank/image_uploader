import React from 'react';
import Style from './index.module.scss';

export default class UploadingModal extends React.Component {
  render() {
    return (
      <div className={Style.modal_wrap}>
        <div className={Style.loader}>Uploading...</div>
      </div>
    )
  }
}