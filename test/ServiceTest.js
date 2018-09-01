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
const Service = require( '../src/Service' ).default

class TestService extends Service {
  constructor() {
    super()
  }

  doStart() {
  }
}

describe( 'Service', () => {
  let service = undefined
  let eventCount = 0
  beforeEach( () => {
    service = new TestService()
    eventCount = 0
    service.on( 'state', () => eventCount++ )
  } )

  describe( 'on calling start()', () => {
    it( 'transitions to "Starting"', ( done ) => {
      service.on( 'state', s => {
        if ( s === 'Starting' ) {
          assert.equal(1, eventCount)
          done()
        }
      } )

      service.start().catch( done )
    } );

    it( 'then transitions to "Running"', ( done ) => {
      service.on( 'state', s => {
        if ( s === 'Running' ) {
          assert.equal( 2, eventCount )
          done()
        }
      } )

      service.start().catch( done )
    } );
  } )


} );

