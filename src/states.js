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

import type {Signal, State, StateInfo} from './Types';

export const states: { [State]: StateInfo } = {
  New: {
    transitions: {
      start: 'Starting',
      stop: 'Terminated',
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
  Terminated: {
    transitions: {
      'stop': 'Terminated',
    },
  },
  Failed: {},
}

export function transition( from: State, signal: Signal ): State {
  let state = states[from]
  if ( state.transitions && state.transitions[signal] )
    return state.transitions[signal]
  throw new Error( `No valid transitions for signal: '${signal}' from state: '${from}'` )
}
