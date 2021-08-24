import React from 'react';
import Style from './index.module.scss';

interface IProps {
  value: string;
  checked: boolean;
  handleClick: () => void;
}

interface IState {

}

export default class RadioGroup extends React.Component<IProps, IState> {
  render() {
    const { value, checked, handleClick } = this.props;
    return (
      <div 
        onClick={handleClick} 
        className={
          !checked
          ? Style.unChecked
          : [Style.unChecked, Style.checked].join(' ')
        }
      >
        {value}
      </div>
    )
  }
}