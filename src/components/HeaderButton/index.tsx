import React from 'react';
import { PageType } from '../../ImageUploader';

interface IProps {
  title?: string;
  className?: string;
  pageType?: PageType;
  handlePage: (type: PageType) => void;
  handleMouseUp: (type: PageType) => void;
  handleMouseDown: (type: PageType) => void;
}

export const HeaderButton = React.forwardRef((props: IProps, ref: React.Ref<HTMLDivElement>) => {
  const { title, className, handlePage, handleMouseDown, handleMouseUp } = props;

  return (
    <div
      className={className}
      onClick={() => handlePage(PageType.UPLOAD)}
      onMouseUp={() => handleMouseUp(PageType.UPLOAD)}
      onMouseDown={() => handleMouseDown(PageType.UPLOAD)}
      ref={ref}
    >
      {/* UPLOAD IMAGES */}
      {title}
    </div>
  )
})

export default HeaderButton;