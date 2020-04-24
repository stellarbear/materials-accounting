import React from 'react';
import { Dropdown, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import sortParagraph from '../helpers/sort_paragraph';
import { withTranslation } from '../components/TranslationWrapper';

export const TABLES_QUERY = gql`
  {
    allTables {
      id
      name
	    items {
        id
        name
      }
    }
  }
`;

class DropdownTables extends React.Component {
  state = {
    tableDisabled: true,
    tableItemList: [],
    error: false,
    tables: [],
    table: '',
    tableItem: ''
  };

  tableChange = (e, { value }) => {
    let table = this.state.tables.find((elem) => elem.id === value);
    let tableItemList = [];
    if (table) {
      tableItemList = table.items;
      tableItemList = tableItemList.map(el => {
        return {
          key: el.id,
          value: el.id,
          text: el.name
        }
      });
    }
    this.setState({
      table: value,
      tableItemList: tableItemList,
      tableItem: ''
    });
    this.props.onChange(value, '');
  }

  tableItemChange = (e, { value }) => {
    this.setState({ tableItem: value });
    this.props.onChange(this.state.table, value);
  }

  componentDidMount = async () => {
    const { client } = this.props;
    try {
      const { data } = await client.query({
        query: TABLES_QUERY,
      });
      const newState = { tables: data.allTables, tableDisabled: false };
      if (this.props.values) {
        newState.table = this.props.values.table;
        newState.tableItem = this.props.values.tableItem;

        let table = newState.tables.find((elem) => elem.id === newState.table);
        let tableItemList = [];
        if (table) {
          tableItemList = table.items;
          tableItemList = tableItemList.map(el => {
            return {
              key: el.id,
              value: el.id,
              text: el.name
            }
          });
        }
        newState.tableItemList = tableItemList;
      }
      this.setState({ ...newState });
    } catch (e) {
      this.setState({ error: true });
    }
  }

  render = () => {
    let { required, errors } = this.props;
    let { tables, tableDisabled, error, tableItemList } = this.state;
    let options = [];
    options = tables.map(el => {
      return {
        key: el.id,
        value: el.id,
        text: el.name
      }
    });
    options.sort((a, b) => {
      return a.text < b.text ? -1 : 1;
    });
    tableItemList.sort((a, b) => sortParagraph(a.text, b.text));

    return (
      <React.Fragment>
        <Form.Field
          required={required}
          error={error || (errors && errors.table)}
          loading={tableDisabled}
          clearable
          searchInput={{ id: 'table' }}
          control={Dropdown}
          label={{ children: this.props.translation.get("Табель"), htmlFor: 'table' }}
          placeholder={this.props.translation.get("Табель")}
          fluid
          selection
          search
          options={options}
          onChange={this.tableChange}
          noResultsMessage='Не найдено'
          labeled
          value={this.state.table}
        />
        {((this.props.filters && this.state.table) || !this.props.filters) && (<Form.Field
          required={required}
          error={errors && errors.tableItem}
          clearable
          disabled={!this.state.table}
          searchInput={{ id: 'tableitem' }}
          label={{ children: this.props.translation.get("Пункт табеля"), htmlFor: 'tableitem' }}
          control={Dropdown}
          options={tableItemList}
          fluid
          labeled
          selection
          search
          noResultsMessage='Не найдено'
          onChange={this.tableItemChange}
          value={this.state.tableItem}
        />)}
      </React.Fragment>
    );
  }
}

export default withApollo(withTranslation(DropdownTables));