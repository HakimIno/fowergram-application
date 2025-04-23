import axios from "axios";

export const httpEndpoint = axios.create({
    baseURL: "http://192.168.95.33:8080",
    timeout: 3 * 60 * 1000,
});