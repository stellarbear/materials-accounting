import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';


const TSTYPE_QUERY = gql`
  {
    allTsTypes {
      id
      name
      withComplectation
    }
  }
`;

export default class DropdownTsTypes extends React.Component {

  render = () => {
    const { placeholder, searchInput, multiple, withoutSVT } = this.props;

    return (
      <Query query={TSTYPE_QUERY}>
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
          let options = data.allTsTypes;
          // Show only TS
          if (withoutSVT) {
            options = options.filter((el) => {
              return el.withComplectation === false
            });
          }
          options = options.map(el => {
            return {
              key: el.id,
              value: el.id,
              text: el.name
            }
          });
          return (
            <Dropdown
              name={this.props.name}
              clearable
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