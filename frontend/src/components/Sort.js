import React from 'react';
import { Icon, Dropdown } from 'semantic-ui-react';
import { withTranslation } from '../components/TranslationWrapper';

class Sort extends React.Component {
  state = {
    field: 'id',
    sortOrder: 1
  }

  componentDidMount = () => {
    const sort = localStorage.getItem("sort");
    if (sort) {
      const newState = { ...this.state, ...JSON.parse(sort) };
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
        content: this.props.translation.get("Тип ТС"),
      },
      {
        key: 'tsPurpose',
        text: 'назначению ТС',
        value: 'tsPurpose',
        content: this.props.translation.get("Назначение ТС"),
      },
      {
        key: 'infoType',
        text: 'обрабатываемой информации',
        value: 'infoType',
        content: this.props.translation.get("Обрабатываемая информация"),
      },
      {
        key: 'unit',
        text: 'подразделению',
        value: 'unit',
        content: this.props.translation.get("Подразделение"),
      },
      {
        key: 'receiptYear',
        text: 'году получения',
        value: 'receiptYear',
        content: this.props.translation.get("Год получения"),
      },
      {
        key: 'commissioningYear',
        text: 'году ввода в эксплуатацию',
        value: 'commissioningYear',
        content: this.props.translation.get("Год ввода в эксплуатацию"),
      },
      {
        key: 'decommissionYear',
        text: 'году вывода из эксплуатации',
        value: 'decommissionYear',
        content: this.props.translation.get("Год вывода из эксплуатации"),
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
            options={options.map(o => {
              o.text = o.content.toLowerCase();
              return o;
            })}
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

export default withTranslation(Sort);