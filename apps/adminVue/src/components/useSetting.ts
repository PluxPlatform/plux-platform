import _ from 'lodash';
import { uuid } from '@plux/editor';
import { round } from '..//utils/math';
import type { Nodes, Node } from '@plux/editor';

export default <T = Node>(
  selected: () => Nodes<T> | Nodes<T>,
  defaultPrecision = 2,
) => {
  const get = () => {
    if (_.isFunction(selected)) {
      return selected();
    }
    return selected;
  };

  const getValue = (
    handler: (item: T) => number | string | boolean | void | number[],
    precision = defaultPrecision,
  ) => {
    const values = _.uniq(_.map(get(), handler));
    if (values.length === 1) {
      if (_.isNumber(values[0])) {
        return round(values[0], precision);
      }
      return values[0];
    }
    return null;
  };

  const setValue = (handler: (item: T, groupId: string) => void) => {
    const groupId = uuid();
    _.each(get(), (item) => {
      handler(item, groupId);
    });
  };

  return { getValue, setValue };
};
