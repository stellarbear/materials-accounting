import React from 'react';
import TsForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import authError from '../../helpers/auth_error';
import { TS_QUERY } from './ts_show'
import Loader from '../../components/Loader';

export const UPDATE_TS_MUTATION = gql`
  mutation updateTS(
    $id: String!,
    $number: String!,
    $unit: String!,
    $tsType: String!,
    $tsPurpose: String!,
    $infoType: String!,
    $receiptYear: String!,
    $commissioningYear: String,
    $decommissionYear: String,
    $table: String!,
    $responsible: String!,
    $comment: String!,
    $tableItem: String!,
    $isBroken: Boolean!,
    $isPrivate: Boolean!,
    $complectation: [String!]!
  ) {
    updateTS(
      id: $id,
      number: $number,
      unit: $unit,
      tsType: $tsType,
      tsPurpose: $tsPurpose,
      infoType: $infoType,
      responsible: $responsible,
      comment: $comment,
      receiptYear: $receiptYear,
      commissioningYear: $commissioningYear,
      decommissionYear: $decommissionYear,
      table: $table,
      tableItem: $tableItem,
      isBroken: $isBroken,
      isPrivate: $isPrivate,
      complectation: $complectation) {
        id
        unit { id name parent { id name } fullPath }
        number
        tsType { id name withComplectation }
        infoType { id name }
        receiptYear
        isBroken
        isPrivate
        commissioningYear
        decommissionYear
        tsPurpose { id name }
        table { id name }
        tableItem { id name }
        complectation {
          id
          name
        }
    }
  }
`;

class TsUpdate extends React.Component {
  render = () => {
    const { id } = this.props.match.params;
    return (
      <Query query={TS_QUERY} variables={{ id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Loader />
            );
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />;
            return <Redirect to='/404' />;
          }
          const ts = data.getTS;
          if (!ts) return <Redirect to='/404' />
          document.title = `${ts.tsType.name} №${ts.number}`;
          return (
            <React.Fragment>
              <Breadcrumb>
                <Breadcrumb.Section><Link to='/'>Технические средства</Link></Breadcrumb.Section>
                <Breadcrumb.Divider icon='right angle' />
                <Breadcrumb.Section active>{`${ts.tsType.name} №${ts.number}`}</Breadcrumb.Section>
              </Breadcrumb>

              <Grid centered>
                <Grid.Row centered columns={1}>
                  <Grid.Column style={{ maxWidth: 800 }}>
                    <TsForm isNewRecord={false} mutation={UPDATE_TS_MUTATION} ts={ts} />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default TsUpdate;