import { OpenAPI } from './generated';
import { API_URL } from '../config';
import { useAuthStore } from '../store/auth';

OpenAPI.BASE = API_URL;
OpenAPI.TOKEN = async () => useAuthStore.getState().token ?? '';
