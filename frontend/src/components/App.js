import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import '../styles/App.css';

import RouteWithLayout from '../layout/RouteWithLayout';
import Error from '../pages/error';
import Login from '../pages/login';

import TsList from '../pages/ts/ts_index';
import TsCreate from '../pages/ts/ts_create';
import TsUpdate from '../pages/ts/ts_update';
import TsShow from '../pages/ts/ts_show';

import TsTypeList from '../pages/ts_types/ts_type_index';

import TsPurposeList from '../pages/ts_purposes/ts_purpose_index';

import InfoTypeList from '../pages/info_types/info_type_index';

import UserList from '../pages/users/user_index';
import UserCreate from '../pages/users/user_create';
import UserUpdate from '../pages/users/user_update';

import UnitList from '../pages/units/unit_index';
import UnitShow from '../pages/units/unit_show';
import UnitCreate from '../pages/units/unit_create';
import UnitUpdate from '../pages/units/unit_update';

import TableList from '../pages/tables/table_index';
import TableCreate from '../pages/tables/table_create';
import TableUpdate from '../pages/tables/table_update';

import Report from '../pages/report/index';

class App extends Component {
  render = () => {
    return (
      <React.Fragment>
        <Switch>
          <Route exact path='/login' component={Login} />
          <RouteWithLayout exact path='/' component={TsList} auth />
          <RouteWithLayout exact path='/report' component={Report} auth />
          <RouteWithLayout exact path='/ts/create' component={TsCreate} auth roles={['moderator', 'admin']} />
          <RouteWithLayout exact path='/ts/:id' component={TsShow} auth />
          <RouteWithLayout exact path='/ts/update/:id' component={TsUpdate} auth roles={['moderator', 'admin']} />
          <RouteWithLayout exact path='/users' component={UserList} auth roles={['admin']} />
          <RouteWithLayout exact path='/users/create' component={UserCreate} auth roles={['admin']} />
          <RouteWithLayout exact path='/users/update/:id' component={UserUpdate} auth roles={['admin']} />
          <RouteWithLayout exact path='/units' component={UnitList} auth roles={['admin']} />
          <RouteWithLayout exact path='/units/create' component={UnitCreate} auth roles={['admin']} />
          <RouteWithLayout exact path='/units/:id' component={UnitShow} auth roles={['admin']} />
          <RouteWithLayout exact path='/units/update/:id' component={UnitUpdate} auth roles={['admin']} />
          <RouteWithLayout exact path='/types' component={TsTypeList} auth roles={['admin']} />
          <RouteWithLayout exact path='/purposes' component={TsPurposeList} auth roles={['admin']} />
          <RouteWithLayout exact path='/info_types' component={InfoTypeList} auth roles={['admin']} />
          <RouteWithLayout exact path='/tables' component={TableList} auth roles={['admin']} />
          <RouteWithLayout exact path='/tables/create' component={TableCreate} auth roles={['admin']} />
          <RouteWithLayout exact path='/tables/update/:id' component={TableUpdate} auth roles={['admin']} />
          <Route component={Error} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;