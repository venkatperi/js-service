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
  | 'Cancelling'

type Signal =
  'start' | 'stop' | 'success' | 'error'

type Transitions = { [Signal]: State }

type StateInfo = {
  transitions?: Transitions
}

const states: { [State]: StateInfo } = {
  New: {
    transitions: {
      start: 'Starting',
    },
  },
  Starting: {
    transitions: {
      success: 'Running',
      error: 'Failed',
      stop: 'Cancelling',
    },
  },
  Running: {
    transitions: {
      stop: 'Stopping',
    },
  },
  Stopping: {
    transitions: {
      success: 'Terminated',
      error: 'Failed',
    },
  },
  Cancelling: {
    transitions: {
      success: 'Terminated',
      error: 'Failed',
    },
  },
  Terminated: {},
  Failed: {},
}

function transition( from: State, signal: Signal ): State {
  let state = states[from]
  if ( state.transitions && state.transitions[signal] )
    return state.transitions[signal]
  throw new Error( `No transition from ${from} on ${signal}` )
}

export default class Service extends EventEmitter {
  failureReason: ?Error

  _state: State = 'New'

  _handlers: { [State]: () => Promise<void> } = {
    Starting: this._starting.bind( this ),
    Running: this._running.bind( this ),
    Stopping: this._stopping.bind( this ),
    Terminated: this._terminated.bind( this ),
    Failed: this._failed.bind( this ),
    Cancelling: this._cancelling.bind( this ),
  }

  constructor() {
    super()
  }

  get state(): State {
    return this._state
  }

  async start() {
    await this._fire( 'start' )
  }

  async stop() {
    await this._fire( 'stop' )
  }

  async doStart() {
    throw new Error( 'Virtual function called' )
  }

  async doStop() {
    throw new Error( 'Virtual function called' )
  }

  async doCancel() {
    throw new Error( 'Virtual function called' )
  }

  async _fire( signal: Signal ) {
    let next = transition( this._state, signal )
    await this._setState( next )
  }

  async _setState( s: State ) {
    this._state = s
    this.emit( 'state', s )
    await this._handlers[s]()
  }

  async _starting() {
    try {
      await this.doStart()
      await this._fire( 'success' )
    }
    catch ( e ) {
      console.log( e )
      this.failureReason = e
      await this._fire( 'error' )
    }
  }

  async _stopping() {
    try {
      await this.doStop()
      await this._fire( 'success' )
    }
    catch ( e ) {
      console.log( e )
      this.failureReason = e
      await this._fire( 'error' )
    }
  }

  async _cancelling() {
    try {
      await this.doCancel()
      await this._fire( 'success' )
    }
    catch ( e ) {
      console.log( e )
      this.failureReason = e
      await this._fire( 'error' )
    }
  }

  async _running() {
  }

  async _terminated() {
  }

  async _failed() {
  }

}
