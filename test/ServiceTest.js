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
import TestService from './fixtures/TestService'

let service = new TestService()

describe( 'Service', () => {

  it( 'initial state is "New"', () => service.inOrder( 'New' ) );

  describe( 'on calling start()', () => {

    it( 'transitions to "Starting""', async () => {
      // noinspection JSIgnoredPromiseFromCall
      service.start() // don't wait start to finish
      service.inOrder( 'New', 'Starting' )
    } );

    it( 'calls doStart()', () => assert( service.startCalled ) );

    it( 'transitions to "Running" when the service is operational', async () => {
      service.completeStart()
      await service.running()
      service.inOrder( 'New', 'Starting', 'Running' )
    } );

    describe( 'subsequently, on calling stop()', () => {

      it( 'transitions to "Stopping"', async () => {
        // noinspection JSIgnoredPromiseFromCall
        service.stop()  // don't await
        service.inOrder( 'New', 'Starting', 'Running', 'Stopping' )
      } );

      it( 'calls doStop()', () => assert( service.stopCalled ) );

      it( 'transitions to "Terminated" when the service has shut down', async () => {
        service.completeStop()
        await service.terminated()
        service.inOrder( 'New', 'Starting', 'Running', 'Stopping', 'Terminated' )
      } );

    } )
  } )

} );

