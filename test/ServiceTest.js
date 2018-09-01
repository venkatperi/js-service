// Copyright 2017, Venkat Peri.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const assert = require( 'assert' )
const chai = require( 'chai' );
const sinon = require( 'sinon' );
const sinonChai = require( 'sinon-chai' );
const sinonChaiInOrder = require( 'sinon-chai-in-order' ).default;
import {Deferred} from '../'
import TestService from './fixtures/TestService'

const { expect } = chai

chai.use( sinonChai )
chai.use( sinonChaiInOrder )

let spy = undefined

function eventOrder( ...events ) {
  let x = expect( spy ).inOrder.to.have.been.calledWith( events[0] )
  for ( let e of events.slice( 1 ) )
    x = x.subsequently.calledWith( e )
}

describe( 'Service', () => {
  let service = undefined
  let opts = {}
  let start = undefined
  let stop = undefined

  before( () => {
    spy = sinon.spy()
    start = new Deferred()
    stop = new Deferred()
    service = new TestService( {
      doStart: async () => await start.promise,
      doStop: async () => await stop.promise,
    } )
    service.on( 'state', spy )
  } )

  it( 'initial state is "New"', async function () {
    eventOrder( 'New' )
    assert.equal( service.state, 'New' )
  } );

  describe( 'on calling start()', function () {

    it( 'transitions to "Starting""', async function () {
      service.start()
      assert( service.state, 'Starting' )
      eventOrder( 'New', 'Starting' )
    } );

    it( 'calls doStart()', function () {
      assert( service.startCalled )
    } );

    it( 'transitions to "Running" when the service is operational', async function () {
      start.resolve()
      await service.running()
      assert( service.state, 'Running' )
      eventOrder( 'New', 'Starting', 'Running' )
    } );

    describe( 'subsequently, on calling start()', function () {
      it( 'transitions to "Stopping"', async function () {
        service.stop()
        assert.equal( service.state, 'Stopping' )
        eventOrder( 'New', 'Starting', 'Running', 'Stopping' )
      } );

      it( 'calls doStop()', function () {
        assert( service.stopCalled )
      } );

      it( 'transitions to "Terminated" when the service has shut down', async function () {
        stop.resolve()
        await service.terminated()
        // console.log(service.state)
        assert.equal( service.state, 'Terminated' )
        eventOrder( 'New', 'Starting', 'Running', 'Stopping', 'Terminated' )
      } );

    } )
  } )

} );

