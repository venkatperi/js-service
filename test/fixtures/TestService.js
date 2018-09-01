// @flow
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


import assert from 'assert'
import {Deferred, Service, ServiceOpts, State} from '../../';
import Spy from './Spy'

export default class TestService extends Service {
  startCalled = false
  stopCalled = false
  cancelCalled = false
  starter = new Deferred()
  stopper = new Deferred()
  spy = new Spy()

  constructor( opts: ServiceOpts ) {
    super( opts )
    this.on( 'state', this.spy.spy )
  }

  async doStart() {
    this.startCalled = true
    await this.starter.promise
  }

  async doStop() {
    this.stopCalled = true
    await this.stopper.promise
  }

  async doCancel() {
    this.cancelCalled = true
  }

  inOrder( ...args: [State] ) {
    this.spy.inOrder( ...args )
    assert.equal( this.state, args[args.length - 1] )
  }

  completeStart() {
    this.starter.resolve()
  }

  failStart( e: any ) {
    this.starter.reject( e )
  }

  completeStop() {
    this.stopper.resolve()
  }

  failStop( e: any ) {
    this.stopper.reject( e )
  }

}

