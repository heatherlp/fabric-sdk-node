/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilteredTransaction } from 'fabric-common';
import { Network } from '../../network';
import { BlockEvent, BlockListener } from './blocklistener';
import { ListenerSession } from './listenersession';
// @ts-ignore no implicit any
import protos = require('fabric-protos');

export class ContractListenerSession implements ListenerSession {
	private readonly listener: BlockListener;
	private chaincodeId: string;
	private network: Network;

	constructor(listener: BlockListener, chaincodeId: string, network: Network) {
		this.listener = listener;
		this.chaincodeId = chaincodeId;
		this.network = network;
	}

	public async start() {
		const blockListener: BlockListener = await this.network.addBlockListener(this.aBlockListenerFunction);
	}

	public close() {
		// TODO: need event source stuff from shared/isolated block listener?
	}

	async aBlockListenerFunction(blockEvent: BlockEvent) {
		// TODO: no error handling in this function

		// If the filtered block exists and it contains filtered transactions
		if (blockEvent.filteredBlock && blockEvent.filteredBlock.filtered_transactions) {
			const contractTransactions: FilteredTransaction[] = [];
			const blockNumber: string = blockEvent.filteredBlock.number;

			// For each of the filteredTransactions
			for (const filteredTransaction of blockEvent.filteredBlock.filtered_transactions) {

				const transactionId: string = filteredTransaction.txid;
				const transactionValidationCode: string = this.getTransactionValidationCode(filteredTransaction);

				// TODO: type for FilteredTransaction.transaction_actions needed here? in fabric-common Line 362 of types
				const transactionActions: any = filteredTransaction.transaction_actions;

				// Check for transaction actions and chaincode actions
				if (transactionActions && transactionActions.chaincode_actions) {
					// for each of the chaincode_actions
					for (const chaincodeAction of transactionActions.chaincode_actions) {

						// fabric-common deletes the chaincode_event.payload, because it's empty for filtered transactions, like this:
						// delete chaincodeAction.chaincode_event.payload;

						const chaincodeEvent = chaincodeAction.chaincode_event;
						// Check the event chaincodeId matches this listeners:
						// TODO: proper regex check here
						if (chaincodeEvent.chaincodeId === this.chaincodeId) {
							// We care about this event
							// EventService.js:1137 is here
							// Store it in contractTransactions
							contractTransactions.push(filteredTransaction);
						}
					}
				}
			}

			if (contractTransactions.length === 0) {
				// We've found no contract transactions in this block
			} else {
				// We've stored some transactions that match this chaincodeId
				// Set filtered transactions to be the ones this contract cares about
				blockEvent.filteredBlock.filtered_transactions = contractTransactions;

				// Need to pass back the chaincode events back to the user supplied listener
				const blockToReturn: BlockEvent = blockEvent;
				await this.listener(blockToReturn);
			}
		}
	}

	// TODO: is this function needed?
	// TODO: any casting here for filteredTransaction, because of no type for filteredTransaction.tx_validation_code
	private getTransactionValidationCode(filteredTransaction: any): string {
		// Validation codes sorting, get from enum in fabric-protos
		const transactionValidationCodes: any = {};
		// TODO: get this from transaction.proto in a better way?
		const keys: string[] = Object.keys(protos.protos.TxValidationCode);
		for (const key of keys) {
			const value: number = protos.protos.TxValidationCode[key];
			transactionValidationCodes[value] = key;
		}

		// TODO: types here
		let transactionValidationCode: any = filteredTransaction.tx_validation_code;

		if (typeof transactionValidationCode !== 'string') {
			transactionValidationCode = transactionValidationCodes[transactionValidationCode];
		}
		return transactionValidationCode;
	}
}

// crap started for full blocks:
// if (blockEvent.block) {
// 	for (let i = 0; i < blockEvent.block.data.data.length; i++) {
// 		const env: any = blockEvent.block.data.data[i];
// 		const channelHeader: any = env.payload.header.channel_header;
// 		if (channelHeader.type === 3) { // only ENDORSER_TRANSACTION have chaincode events
// 			const transaction: any = env.payload.data;
// 			if (transaction && transaction.actions) {
// 				for (const payload of transaction.actions) {
// 					const chaincodeEvent: any = payload.action.proposal_response_payload.extension.events;
// 					const transactionStatusCodes: any = blockEvent.block.metadata.metadata[protos.common.BlockMetadataIndex.TRANSACTIONS_FILTER];
// 					const transactionStatusCode = transactionStatusCodes[i];
// 				}
// 			}
// 		}
// 	}
