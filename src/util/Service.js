// @flow

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


import EventEmitter from 'events'

type State =
  'New'
  | 'Starting'
  | 'Running'
  | 'Stopping'
  | 'Terminated'
  | 'Failed'


const stateValues = {
  New: 10,
  Starting: 20,
  Running: 30,
  Stopping: 40,
  Terminated: 50,
  Failed: 60,
}

export default class Service extends EventEmitter {
  _state: State = 'New'

  constructor() {
    super()
  }

  get isRunning(): boolean {
    return this._state === 'Running'
  }

  get isStopped(): boolean {
    return this._state === 'Terminated'
  }

  get state(): State {
    return this._state
  }

  /**
   * If the service state is {@link State#New}, this initiates service startup and returns
   * immediately. A stopped service may not be restarted.
   *
   * @throws IllegalStateException if the service is not {@link State#New}
   */
  async start() {
    if ( this._state !== 'New' )
      throw new Error( `Cannot start from state ${this._state}` )

    this._setState( 'Starting' )
    await this.doStart()
    this._setState( 'Running' )
  }

  /**
   * If the service is {@link State#Starting starting} or {@link State#Running running},
   * this initiates service shutdown and returns immediately. If the service is {@link
    * State#New new}, it is {@link State#Terminated terminated} without having been started nor
   * stopped. If the service has already been stopped, this method returns immediately without
   * taking action.
   *
   */
  async stop() {
    switch ( this._state ) {
      case 'Terminated':
        break;

      case 'New':
        this._setState( 'Terminated' )
        break

      case 'Starting':
      case 'Running':
        this._setState('Stopping')
        await this.doStop()
        this._setState('Terminated')
        break

      default:
        throw new Error( `Cannot stop from state ${this._state}` )
    }
  }

  async doStart() {
    return Promise.reject( new Error( 'Virtual function called' ) )
  }

  async doStop() {
    return Promise.reject( new Error( 'Virtual function called' ) )
  }

  _setState( state: State ) {
    if ( stateValues[state] <= stateValues[this._state] )
      throw new Error( `Illegal state transition (${this._state} -> ${state})` )

    this._state = state
    this.emit( 'state', state )
  }

}
