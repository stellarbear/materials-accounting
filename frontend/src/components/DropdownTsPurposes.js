import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const TSPURPOSE_QUERY = gql`
  {
    allTsPurposes {
      id
      name
    }
  }
`;

export default class DropdownTsPurposes extends React.Component {

  render = () => {
    const { placeholder, searchInput, multiple } = this.props;

    return (
      <Query query={TSPURPOSE_QUERY}>
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
          let options = data.allTsPurposes;
          options = options.map(el => {
            return {
              key: el.id,
              value: el.id,
              text: el.name
            }
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