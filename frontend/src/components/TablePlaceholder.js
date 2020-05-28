import React from 'react';
import { Grid, Header, Table } from 'semantic-ui-react';
import Loader from './Loader';

const TablePlaceholder = (props) => {
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={3}>
        </Grid.Column>
        <Grid.Column width={10}>
          <Table striped color='blue'>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan='3'>
                  <Header as='h3' floated='left'>{props.name}</Header>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Loader />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default TablePlaceholder;