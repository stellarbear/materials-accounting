import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import 'semantic-ui-less/semantic.less';
import './styles/index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from "apollo-link-error"
import { ApolloLink } from "apollo-boost";

const host = window.location.hostname || "localhost";
const port = 4000;
const endpoint = "graphql";

const httpLink = createHttpLink({
  uri: `http://${host}:${port}/${endpoint}`,
  credentials: 'include',
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message))
})

const link = ApolloLink.from([
  errorLink,
  httpLink
]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id
  })
});

ReactDOM.render(
  <HashRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </HashRouter>,
  document.getElementById('root')
)
serviceWorker.unregister();