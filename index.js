const express = require('express');
const AinJs = require('@ainblockchain/ain-js').default;
const app = express();
const { parsePath, formatPath } = require('./util');
const port = 80;
const blockchainEndpoint = 'http://dev-api.ainetwork.ai/';
const ain = new AinJs(blockchainEndpoint, 0);
const BOT_NAME = 'hyeonwoong-echo-bot';
const BOT_PK = process.env.AINIZE_USER_PRIVATE_KEY;
const BOT_ADDRESS = AinJs.utils.toChecksumAddress(ain.wallet.add(BOT_PK)); // 0x09A0d53FDf1c36A131938eb379b98910e55EEfe1
ain.wallet.setDefaultAccount(BOT_ADDRESS);

app.use(express.json());


app.get('/', (req, res, next) => {
  res.status(200)
    .set('Content-Type', 'text/plain')
    .send('Echo Bot is alive!')
    .end();
});

app.post('/trigger', async (req, res) => {
  res.send('Triggered!');

  const tx = req.body.transaction;
  if (!tx || !tx.tx_body || !tx.tx_body.operation) {
    console.log(`Invalid tx: ${JSON.stringify(tx)}`);
    return;
  }
  if (tx.tx_body.operation.type !== 'SET_VALUE') {
    console.log(`Not supported tx type: ${tx.tx_body.operation.type}`)
    return;
  }
  const ref = tx.tx_body.operation.ref;
  const parsedRef = parsePath(ref);
  const userVal = tx.tx_body.operation.value;
  if (parsedRef.length !== 6 || parsedRef[0] !== 'apps' || parsedRef[2] !== 'messages' ||
      parsedRef[5] !== 'user') {
    console.log(`Not supported path pattern: ${ref}`);
    return;
  }
  const answerRef = formatPath([...parsedRef.slice(0, parsedRef.length - 1), BOT_NAME]);
  const result = await ain.db.ref(answerRef).setValue({
    value: `Did you mean ${JSON.stringify(userVal)}?`,
    nonce: -1,
  })
  .catch((e) => {
    console.error(`setValue failure:`, e);
  });
  console.log('result:', result);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});