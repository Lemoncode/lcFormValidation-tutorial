import devStore from './store.dev';
import prodStore from './store.prod';

export const store = process.env.NODE_ENV === 'production' ? prodStore : devStore;
