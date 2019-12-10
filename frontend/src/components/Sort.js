import React from 'react';
import { Icon, Dropdown } from 'semantic-ui-react';

class Sort extends React.Component {
  state = {
    field: 'id',
    sortOrder: 1
  }

  componentDidMount = () => {
    const sort = localStorage.getItem("sort");
    if (sort) {
      const newState = { ...JSON.parse(sort) };
      this.updateState(newState)
    }
  }

  updateState = (newState) => {
    this.setState({ ...newState });
    this.props.onChange({ ...this.state, ...newState })
    localStorage.setItem("sort", JSON.stringify({ ...this.state, ...newState }))
  }

  render = () => {
    const options = [
      {
        key: 'id',
        text: 'дате добавления',
        value: 'id',
        content: 'Дата добавления',
      },
      {
        key: 'tsType',
        text: 'типу ТС',
        value: 'tsType',
        content: 'Тип ТС',
      },
      {
        key: 'tsPurpose',
        text: 'назначению ТС',
        value: 'tsPurpose',
        content: 'Назначение ТС',
      },
      {
        key: 'infoType',
        text: 'обрабатываемой информации',
        value: 'infoType',
        content: 'Обрабатываемая информация',
      },
      {
        key: 'unit',
        text: 'подразделению',
        value: 'unit',
        content: 'Подразделение',
      },
      {
        key: 'receiptYear',
        text: 'году получения',
        value: 'receiptYear',
        content: 'Год получения',
      },
      {
        key: 'commissioningYear',
        text: 'году ввода в эксплуатацию',
        value: 'commissioningYear',
        content: 'Год ввода в эксплуатацию',
      },
      {
        key: 'decommissionYear',
        text: 'году вывода из эксплуатации',
        value: 'decommissionYear',
        content: 'Год вывода из эксплуатации',
      },
    ];
    const { updateState, state } = this;
    const { field, sortOrder } = state;

    return (
      <React.Fragment>
        <label htmlFor='sort'>Сортировать по{' '}
          <Dropdown
            pointing
            inline
            options={options}
            value={field}
            id='sort'
            onChange={(e, { value }) => updateState({ field: value, sortOrder: 1 })}
          />
        </label>

        {field && (
          <Icon
            link
            name={(sortOrder === 1) ? 'sort amount up' : 'sort amount down'}
            onClick={() => updateState({ sortOrder: -state.sortOrder })}
          />
        )
        }
      </React.Fragment>
    );
  }
}

export default Sort;