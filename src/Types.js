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

/**
 * The lifecycle states of a service.
 *
 * <p>The ordering of the {@link State} enum is defined such that if there is a state transition
 * from {@code A -> B} then {@code A.compareTo(B) < 0}. N.B. The converse is not true, i.e. if
 * {@code A.compareTo(B) < 0} then there is <b>not</b> guaranteed to be a valid state transition
 * {@code A -> B}.
 *
 */
export type State =
  'New'           // A service in this state is inactive.
  | 'Starting'    // The service is transitioning to #Running
  | 'Running'     // The service is operational
  | 'Stopping'    // The service is transitioning to #Terminated
  | 'Terminated'  // The service has completed execution normally
  | 'Failed'      // The service encountered a problem and may not be operational.
  | 'Cancelling'  // The service was stopped before it became fully operational and is transitioning to #Terminated

export type Signal =
  'start' | 'stop' | 'success' | 'error'

export type Transitions = { [Signal]: State }

export type StateInfo = {
  transitions?: Transitions
}
export type Handler = () => Promise<void>

export type Logger = ( ...args: [any] ) => void

export type ServiceOpts = { name: string, logger?: Logger }
