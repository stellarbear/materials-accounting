import React from 'react';
import Unit from '../../components/Unit';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Redirect, Link } from 'react-router-dom';
import { Grid, List, Header, Table, Button } from 'semantic-ui-react';
import { list_to_tree } from '../../helpers/tree';
import authError from '../../helpers/auth_error';
import TablePlaceholder from '../../components/TablePlaceholder';
import { withTranslation } from '../../components/TranslationWrapper';

export const UNITS_QUERY = gql`
  {
    allUnits {
      id
      name
	    parent {
        id
        name
      }
	    children {
        id
        name
      }
    }
  }
`;

class UnitList extends React.Component {
  render = () => {
    document.title = this.props.translation.get("Подразделение");
    return (
      <Query query={UNITS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return <TablePlaceholder name={this.props.translation.get("Подразделение")} />
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const unitsToRender = list_to_tree(data.allUnits);
          return (
            <Grid>
              <Grid.Row>
                <Grid.Column width={3}>
                </Grid.Column>
                <Grid.Column width={10}>
                  <Table striped color='blue'>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          <Header as='h3' floated='left'>{this.props.translation.get("Подразделение")}</Header>
                          <Button
                            color='blue'
                            floated='right'
                            icon='plus'
                            content='Добавить'
                            size='tiny'
                            as={Link}
                            to='/units/create'
                          />
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>
                          <List>
                            {unitsToRender.map(unit => <Unit key={unit.id} unit={unit} />)}
                          </List>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          );
        }}
      </Query>
    );
  }
}

export default withTranslation(UnitList);