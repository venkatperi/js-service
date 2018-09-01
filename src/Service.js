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


import EventEmitter from 'events'
import Deferred from './Deferred'
import {transition} from './states';
import type {
  Handler,
  Logger,
  ServiceOpts,
  Signal,
  State,
} from './Types';

const nop: Logger = ( ...args ) => {
}

/**
 * An object with an operational state, plus {@link #start()} and {@link
  * #stop()} lifecycle methods to transition between states.
 * Example services include webservers, RPC servers and timers.
 *
 * <p>The normal lifecycle of a service is:
 *
 * <ul>
 *   <li>{@linkplain State#New New} -&gt;
 *   <li>{@linkplain State#Starting Starting} -&gt;
 *   <li>{@linkplain State#Running Running} -&gt;
 *   <li>{@linkplain State#Stopping Stopping} -&gt;
 *   <li>{@linkplain State#Terminated Terminated}
 * </ul>
 *
 * <p>There are deviations from this if there are failures or if {@link Service#stop} is called
 * before the {@link Service} reaches the {@linkplain State#Running Running} state. The set of legal
 * transitions form a <a href="http://en.wikipedia.org/wiki/Directed_acyclic_graph">DAG</a>,
 * therefore every method of the listener will be called at most once. N.B. The {@link State#Failed}
 * and {@link State#Terminated} states are terminal states, once a service enters either of these
 * states it cannot ever leave them.
 *
 */
export default class Service extends EventEmitter {
  /**
   * Returns the {@link Error} that caused this service to fail.
   */
  failureReason: ?Error

  // The service's name
  name: string

  logger: Logger

  _state: State = 'New'

  _statePromises: { [State]: Deferred } = {
    Running: new Deferred(),
    Terminated: new Deferred(),
  }

  _handlers: { [State]: Handler } = {
    Starting: this._starting.bind( this ),
    Running: this._running.bind( this ),
    Stopping: this._stopping.bind( this ),
    Terminated: this._terminated.bind( this ),
    Cancelling: this._cancelling.bind( this ),
    Failed: this._failed.bind( this ),
  }

  constructor( { name, logger }: ServiceOpts = {} ) {
    super();
    this.name = name || ''
    this.logger = logger || nop
    this.on( 'newListener', ( e, l ) => {
      if ( e === 'state' )
        l( this._state )
    } )
  }

  /** Returns the lifecycle state of the service. */
  get state(): State {
    return this._state
  }

  /** Returns {@code true} if this service is {@linkplain State#Running Running}. */
  get isRunning(): boolean {
    return this._state === 'Running'
  }

  /**
   * Returns a Promise that resolves when the service
   * enters the 'Running' state.
   * @return {Promise<void>}
   */
  async running() {
    await this._statePromises['Running'].promise
  }

  /**
   * Returns a Promise that is satisfied when the service
   * enters the a terminal state ('Terminated' or 'Failed')
   *
   * If the service enters 'Failed', the returned promise
   * rejects with the failure reason
   * @return {Promise<void>}
   */
  async terminated() {
    await this._statePromises['Terminated'].promise
  }

  /**
   * If the service state is {@link State#New}, this initiates service startup and returns
   * immediately. A stopped service may not be restarted.
   *
   * @throws Error if the service is not {@link State#New}
   */
  async start() {
    await this._fire( 'start' )
  }

  /**
   * If the service is {@linkplain State#Starting Starting} or {@linkplain State#Running Running},
   * this initiates service shutdown and returns immediately. If the service is {@linkplain
   * State#New New}, it is {@linkplain State#Terminated Terminated} without having been started nor
   * stopped. If the service has already been stopped, this method returns immediately without
   * taking action.
   *
   */
  async stop() {
    await this._fire( 'stop' )
  }

  /**
   * This method is called by {@link #start} to initiate service startup.
   *
   * This method returns {@link Promise} which should resolve when the service is
   * operational or reject with the reason of failure.
   *
   * It is invoked exactly once on service startup, even when {@link #start} is
   * called multiple times.
   */
  async doStart() {
    throw new Error( 'Virtual function called' )
  }

  /**
   * This method should be used to initiate service shutdown.
   *
   * This method returns {@link Promise} which should resolve when the service is
   * has shut down or reject with the reason of failure.
   *
   */
  async doStop() {
    throw new Error( 'Virtual function called' )
  }

  /**
   * This method should be used to cancel service startup if {@link #stop()} is called
   * before the service has transitioned to #Running
   *
   * This method returns {@link Promise} which should resolve when the service is
   * has shut down or reject with the reason of failure.
   */
  async doCancel() {
    throw new Error( 'Virtual function called' )
  }

  /// Private

  async _fire( signal: Signal ) {
    this.logger( `fire: ${signal} from ${this._state}` )
    let next = transition( this._state, signal )
    await this._setState( next )
  }

  async _setState( s: State ) {
    this.logger( `setState: ${this._state} -> ${s}` )
    if ( s === this._state ) return
    this._state = s
    this.emit( 'state', s )
    this.emit( s.toLowerCase() )
    if ( this._handlers[s] ) {
      await this._handlers[s]()
    }
  }

  async _starting() {
    try {
      await this._tryRun( this.doStart.bind( this ) )
    } catch ( e ) {
      this._statePromises['Running'].reject( e )
      throw e
    }
  }

  async _stopping() {
    try {
      await this._tryRun( this.doStop.bind( this ) )
    } catch ( e ) {
      this._statePromises['Terminated'].reject( e )
      throw e
    }
  }

  async _cancelling() {
    await this._tryRun( this.doCancel.bind( this ) )
  }

  async _running() {
    this._statePromises['Running'].resolve()
  }

  async _terminated() {
    this._statePromises['Terminated'].resolve()
  }

  async _failed() {
    // this._statePromises['Terminated'].reject( this.failureReason )
  }

  async _tryRun( f: Handler ) {
    try {
      await f()
      await this._fire( 'success' )
    }
    catch ( e ) {
      this.failureReason = e
      await this._fire( 'error' )
      throw e
    }
  }
}
