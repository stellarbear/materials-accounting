import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { is_parent } from '../helpers/tree';

const UNITS_QUERY = gql`
  {
    allUnits {
        id
        name
	      parent {
          id
          name
        }
        fullPath
    }
  }
`;

export default class DropdownUnits extends React.Component {

  render = () => {
    const { placeholder, searchInput, multiple } = this.props;

    return (
      <Query query={UNITS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Dropdown
                disabled
                loading />
            );
          };
          if (error) {
            return (
              <Dropdown
                disabled
                error />
            );
          }
          let options = data.allUnits;
          if (this.props.ommit) {
            options = options.filter(elem => !is_parent(options, this.props.ommit, elem.id));
          }
          options = options.map(el => {
            return {
              key: el.id,
              value: el.id,
              text: el.fullPath.join(', ')
            }
          });
          options.sort((a, b) => {
            return a.text < b.text ? -1 : 1;
          });
          return (
            <Dropdown
              clearable
              name={this.props.name}
              multiple={multiple}
              searchInput={searchInput}
              fluid
              selection
              search
              options={options}
              value={this.props.value}
              onChange={this.props.onChange}
              placeholder={placeholder}
              noResultsMessage='Не найдено'
              labeled />
          );
        }}
      </Query>
    );
  }
}