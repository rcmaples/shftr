import { GET_ERRORS, CLEAR_ERRORS } from '../actions/types';

const initialState = {};

export default function (state = initialState, action) {
  switch (action.type) {
    case CLEAR_ERRORS:
      return {
        ...initialState,
      };
    case GET_ERRORS:
      let type = action.payload.type;
      let status = action.payload.status;
      let statusText = action.payload.statusText;
      return {
        ...state,
        type,
        message: `${status} ${statusText}`,
      };
    default:
      return state;
  }
}
