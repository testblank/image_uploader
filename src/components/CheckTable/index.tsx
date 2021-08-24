import React from 'react';
import TableList from './TableList';
import { ITableListInfo } from './TableList';

import Style from './index.module.scss';

interface IProps {

}
interface IState {
  drag: boolean;
  table: any[];
  dragging: boolean;
  tableName: string;
  tableList: ITableListInfo
}


export default class CheckTable extends React.Component<IProps, IState> {
  public state = {
    drag: true,
    table: [],
    dragging: false,
    tableName: '',
    tableList: {},
  }

  private dropRef = React.createRef<HTMLDivElement>();
  private dragCounter: number = 0;

  public componentDidMount() {
    this.setState({
      tableList: require('../../res/tableData.json'),
    })
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

  private handleDrop = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ drag: false, dragging: false });

    if (e.dataTransfer.files[0].type.match('application/json')) {
      const file = e.dataTransfer.files[0];
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const table = JSON.parse(e.currentTarget!.result);
        this.setState({ table, tableName: file.name })
      }
      reader.readAsText(file)
    }
    else {
      return;
    }
  }

  private listRender = () => {
    const { table, tableName } = this.state;
    if (table.length && tableName !== '') {
      return (
        <TableList table={table} tableName={tableName} />
      )
    }
  }

  public render() {
    const { dragging, tableName, tableList } = this.state;
    const keyList = Object.keys(tableList);
    keyList.sort();

    return (
      <div className={Style.wrap} ref={this.dropRef} style={{ color: 'white' }}>
        <div className={Style.key_list_wrap}>
          Available Tables
          <ul>
            {
              keyList.map((key: string) => (
                <li key={key}>{key}</li>
              ))
            }
          </ul>
        </div>
        {dragging
          ?
          <div className={Style.cover}>
            <div className={Style.inner}>
              <div className={Style.inner_text}>
                <span role={'img'} aria-label={'bear'}>🧸</span>
              </div>
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
        </div>
        <div style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <div className={Style.list_wrap}>
            {this.listRender()}
          </div>
        </div>
      </div>
    )
  }
}