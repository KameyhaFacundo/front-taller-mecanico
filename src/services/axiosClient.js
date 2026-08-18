import axios from 'axios'
import { API_BASE_URL } from '../config/config'

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

export default axiosClient
