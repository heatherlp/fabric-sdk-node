/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import sinon = require('sinon');
import chai = require('chai');
const expect = chai.expect;

import { Channel, Client, Endorser, Eventer, IdentityContext } from 'fabric-common';
import { BlockEvent, BlockListener } from '../../../src/impl/event/blocklistener';
import { EventServiceManager } from '../../../src/impl/event/eventservicemanager';
import { Network, NetworkImpl } from '../../../src/network';
import * as testUtils from '../../testutils';
import { StubEventService } from './stubeventservice';
import Contract = require('../../../src/contract');
import ContractImpl = require('../../../src/contract');

import Long = require('long');

import Gateway = require('../../../src/gateway');

interface StubBlockListener extends BlockListener {
	completePromise: Promise<BlockEvent[]>;
}

describe('contract event listener', () => {
	let eventServiceManager: EventServiceManager;
	let eventService: StubEventService;
	let gateway: sinon.SinonStubbedInstance<Gateway>;
	let network: Network;
	let channel: sinon.SinonStubbedInstance<Channel>;
	let listener: StubBlockListener;
	let contract: Contract;

	beforeEach(async () => {
		eventService = new StubEventService('stub');

		gateway = sinon.createStubInstance(Gateway);
		gateway.identityContext = sinon.createStubInstance(IdentityContext);
		gateway.getIdentity.returns({
			mspId: 'mspId'
		});

		channel = sinon.createStubInstance(Channel);
		channel.newEventService.returns(eventService);

		const endorser = sinon.createStubInstance(Endorser);
		(endorser as any).name = 'endorser';
		channel.getEndorsers.returns([endorser]);

		const client = sinon.createStubInstance(Client);
		const eventer = sinon.createStubInstance(Eventer);
		client.newEventer.returns(eventer);
		(channel as any).client = client;

		network = new NetworkImpl(gateway, channel);

		eventServiceManager = (network as any).eventServiceManager;

		listener = testUtils.newAsyncListener<BlockEvent>();

		const chaincodeID: string = 'bourbons';
		const namespace: string = 'biscuitContract';
		const collections: string[] = ['collection1', 'collection2'];
		contract = new ContractImpl(network, chaincodeID, namespace, collections);
	});

	afterEach(() => {
		sinon.restore();
	});

	function newEvent(blockNumber: number) {
		return {
			eventService,
			blockNumber: new Long(blockNumber)
		};
	}

	it('add listener returns the listener', async () => {
		const result = await contract.addContractListener(listener);
		expect(result).to.equal(listener);
	});

	// TODO: check I can access Contract information here?

	it('listener not called if block contains no chaincode events', async () => {
		const event = newEvent(1); // Block event with no chaincode events
		const spy = sinon.spy(listener);
		const blockListener = testUtils.newAsyncListener<BlockEvent>();
		await contract.addContractListener(spy);
		await network.addBlockListener(blockListener);
		eventService.sendEvent(event);
		await blockListener.completePromise;
		sinon.assert.notCalled(spy);
	});

	xit('listener receives events', async () => {
		const event = newEvent(1); // TODO: create a Block event with a chaincode event
		await contract.addContractListener(listener);
		eventService.sendEvent(event);
		const actual = await listener.completePromise;
		expect(actual).to.deep.equal([ /* insert your expected contract event here */ ]);
	});

});
