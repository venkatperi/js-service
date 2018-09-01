//  Copyright 2018, Venkat Peri.
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the
//  "Software"), to deal in the Software without restriction, including
//  without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to permit
//  persons to whom the Software is furnished to do so, subject to the
//  following conditions:
//
//  The above copyright notice and this permission notice shall be included
//  in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//  USE OR OTHER DEALINGS IN THE SOFTWARE.

import assert from 'assert';
import TestService from './fixtures/TestService';
import delay from './fixtures/delay';

let service = new TestService(  )

describe( 'on failure during shutdown', () => {

  it( 'transitions to "Failed"', async () => {
    // noinspection JSIgnoredPromiseFromCall
    service.start()
    service.completeStart()
    await service.running()
    await delay(100)

    service.stop().catch( () => {
      //ignore error
    } )

    service.failStop( 'test error' )
    try {
      await service.terminated()
    }
    catch ( e ) {
      assert( e, 'test error' )
      service.inOrder( 'New', 'Starting', 'Running', 'Stopping', 'Failed' )
    }
  } );

  it( 'reports the failure reason in failureReason"', async () => {
    assert( service.failureReason, 'test error' )
  } );
} )

