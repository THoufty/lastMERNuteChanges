const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');

const path = require('path');
const db = require('./config/connection');
const mongoose = require('mongoose');
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT || 3001;

const app = express();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lastMERNuteChanges', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };
  
// Call the async function to start the server
  startApolloServer(typeDefs, resolvers);
 