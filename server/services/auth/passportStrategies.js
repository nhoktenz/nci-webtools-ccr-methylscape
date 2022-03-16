const { Issuer, Strategy, generators } = require('openid-client');
const { codeVerifier, codeChallenge, nonce } = generators;

async function createOAuthStrategy({ baseUrl, clientId, clientSecret, redirectUris, params}) {
  const { Client } = await Issuer.discover(baseUrl);

  const client = new Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: redirectUris,
    response_types: ['code'],
  });

  params = {
    code_challenge: codeChallenge(codeVerifier()),
    code_challenge_method: 'S256',
    nonce: nonce(),
    ...params,
  };

  return new Strategy({ client, params }, (tokenSet, done) => {
    console.log('tokenSet', tokenSet);
    done(null, tokenSet.claims());
  });
}


async function createPkceStrategy({ baseUrl, clientId, redirectUris, params }) {
  const { Client } = await Issuer.discover(baseUrl);

  const client = new Client({
    client_id: clientId,
    redirect_uris: redirectUris,
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
  });

  params = {
    code_challenge: codeChallenge(codeVerifier()),
    code_challenge_method: 'S256',
    nonce: nonce(),
    ...params,
  };

  return new Strategy({ client, params }, (tokenSet, done) => {
    console.log('tokenSet', tokenSet);
    done(null, tokenSet.claims());
  });
}

module.exports = {
  createOAuthStrategy,
  createPkceStrategy,
};
