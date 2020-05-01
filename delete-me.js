// These work:
// const protosObject = fabprotos.get('protos');
// this too:
// const protosObject = fabprotos.get('protos');
// const TxValidationCode = protosObject.get('TxValidationCode');
// lookup, lookupEnum, lookUpType doesn't work
// const TxValidationCode = fabprotos.lookupTypeOrEnum('protos.TxValidationCode');
// const tester = fabprotos.lookupTypeOrEnum('protos.TxValidationCode').toJSON();