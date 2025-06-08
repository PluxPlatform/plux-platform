import { now, times, random } from 'lodash';

export const uuid = (suffix = '') => `${suffix}${now()}${times(10, () => random(0, 9)).join('')}`;

export default uuid;
